import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function AnalyticsChart({ stats }) {
  const data = {
    labels: ["Interviews", "Questions", "Resumes", "DSA Solved"],
    datasets: [
      {
        label: "Activity",
        data: [
          stats?.totalInterviews || 0,
          stats?.totalQuestions || 0,
          stats?.resumeAnalyses || 0,
          stats?.dsaSolved || 0,
        ],
        backgroundColor: ["#6f6ff5", "#8b5cf6", "#22c55e", "#f59e0b"],
        borderRadius: 8,
        maxBarThickness: 48,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#15151d",
        borderColor: "#26262f",
        borderWidth: 1,
        padding: 10,
        titleColor: "#e2e8f0",
        bodyColor: "#cbd5e1",
      },
    },
    scales: {
      x: {
        ticks: { color: "#94a3b8", font: { size: 11 } },
        grid: { display: false },
      },
      y: {
        ticks: { color: "#94a3b8", font: { size: 11 }, precision: 0 },
        grid: { color: "#1c1c26" },
      },
    },
  };

  return (
    <div className="h-56">
      <Bar data={data} options={options} />
    </div>
  );
}

export default AnalyticsChart;
