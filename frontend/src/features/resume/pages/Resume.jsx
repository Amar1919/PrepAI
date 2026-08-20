import { useEffect, useState } from "react";
import { getResumeHistory } from "../services/resumeService";
import ResumeAnalyzer from "../components/ResumeAnalyzer";
import ResumeHistory from "../components/ResumeHistory";
import { ListSkeleton } from "../../../shared/components/Skeleton";

function Resume() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const res = await getResumeHistory();
      setAnalyses(res.data.analyses);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="space-y-5">
      <ResumeAnalyzer onAnalyzed={fetchHistory} />

      <div className="card p-5">
        <h2 className="section-title mb-4">History</h2>
        {loading ? <ListSkeleton rows={3} /> : <ResumeHistory analyses={analyses} />}
      </div>
    </div>
  );
}

export default Resume;
