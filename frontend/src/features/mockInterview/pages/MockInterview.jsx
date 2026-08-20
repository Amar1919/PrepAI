import { useEffect, useRef, useState } from "react";
import { FiMic, FiMicOff, FiVolume2, FiRefreshCw, FiSend, FiLoader, FiAlertTriangle } from "react-icons/fi";
import { getErrorMessage } from "../../../shared/services/api";
import FeedbackCard from "../../../shared/components/FeedbackCard";
import { useToast } from "../../../shared/context/ToastContext";
import { useAuth } from "../../../shared/context/AuthContext";
import { evaluateAnswer } from "../../interviews/services/interviewService";

const DEFAULT_QUESTIONS = [
  "Tell me about yourself.",
  "What is your greatest strength and how does it apply to this role?",
  "Describe a challenging technical problem you solved recently.",
  "Why do you want to work at our company?",
  "Where do you see yourself in 5 years?",
  "Explain a project you're proud of, from start to finish.",
  "How do you handle disagreements with teammates?",
  "What is your approach to learning a new technology quickly?",
];

function getSpeechRecognition() {
  return window.SpeechRecognition || window.webkitSpeechRecognition;
}

function MockInterview() {
  const toast = useToast();
  const { patchUser } = useAuth();

  const [questions] = useState(DEFAULT_QUESTIONS);
  const [qIndex, setQIndex] = useState(0);

  // Split into final (confirmed) and interim (still-being-recognized) text.
  // The old version only ever wrote to state on isFinal results, which can
  // take several seconds to arrive (or never, for short answers) - that's
  // why it looked like nothing was being captured.
  const [finalTranscript, setFinalTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [manualEdit, setManualEdit] = useState(false);

  const [listening, setListening] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [micError, setMicError] = useState("");

  const recognitionRef = useRef(null);
  const shouldListenRef = useRef(false);
  const supported = !!getSpeechRecognition();

  const liveTranscript = (finalTranscript + " " + interimTranscript).trim();
  const transcript = manualEdit ? finalTranscript : liveTranscript;

  useEffect(() => {
    if (!supported) return;

    const SpeechRecognition = getSpeechRecognition();
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let finalChunk = "";
      let interimChunk = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalChunk += text + " ";
        } else {
          interimChunk += text;
        }
      }

      if (finalChunk) {
        setFinalTranscript((prev) => (prev ? prev + " " + finalChunk : finalChunk).trim());
      }
      // Always update interim so words appear live as the user speaks,
      // instead of waiting for a "final" result that may lag or never fire.
      setInterimTranscript(interimChunk);
    };

    recognition.onerror = (event) => {
      if (event.error === "no-speech" || event.error === "aborted") {
        // Not fatal - browser paused on silence. onend will restart it
        // automatically below if the user still wants to be listening.
        return;
      }
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setMicError("Microphone access was denied. Allow it in your browser's site settings and reload.");
      } else if (event.error === "audio-capture") {
        setMicError("No microphone found. Check one is connected and not in use by another app.");
      } else if (event.error === "network") {
        setMicError("Speech recognition needs an internet connection (Chrome sends audio to Google's servers to transcribe it).");
      } else {
        setMicError(`Voice input error: ${event.error}`);
      }
      shouldListenRef.current = false;
      setListening(false);
    };

    recognition.onend = () => {
      // Chrome silently ends the session after a pause even mid-answer,
      // even with continuous: true. Auto-restart unless the user stopped
      // it themselves. A tiny delay avoids "recognition already started"
      // errors from restarting before the browser has fully torn down.
      if (shouldListenRef.current) {
        setTimeout(() => {
          if (!shouldListenRef.current) return;
          try {
            recognition.start();
          } catch {
            // Transient race (already running) - safe to ignore.
          }
        }, 250);
      } else {
        setListening(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      shouldListenRef.current = false;
      recognition.stop();
    };
  }, [supported]);

  const currentQuestion = questions[qIndex];

  const speakQuestion = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentQuestion);
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = async () => {
    if (!supported) {
      toast.error("Voice input isn't supported in this browser. Try Chrome or Edge.");
      return;
    }

    // Web Speech API requires a secure context (HTTPS or localhost).
    // Testing over a LAN IP like http://192.168.x.x fails silently
    // without this check.
    if (!window.isSecureContext) {
      setMicError("Voice input needs HTTPS (or localhost). It won't work over a plain http:// address.");
      return;
    }

    if (listening) {
      shouldListenRef.current = false;
      recognitionRef.current.stop();
      setListening(false);
      return;
    }

    setMicError("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
    } catch {
      setMicError("Microphone access was denied. Allow it in your browser's site settings and try again.");
      return;
    }

    setFinalTranscript("");
    setInterimTranscript("");
    setManualEdit(false);
    setFeedback("");
    shouldListenRef.current = true;
    try {
      recognitionRef.current.start();
      setListening(true);
    } catch {
      setListening(true);
    }
  };

  const nextQuestion = () => {
    window.speechSynthesis?.cancel();
    shouldListenRef.current = false;
    if (listening) recognitionRef.current?.stop();
    setListening(false);
    setFinalTranscript("");
    setInterimTranscript("");
    setManualEdit(false);
    setFeedback("");
    setMicError("");
    setQIndex((prev) => (prev + 1) % questions.length);
  };

  const handleManualChange = (e) => {
    setManualEdit(true);
    setFinalTranscript(e.target.value);
    setInterimTranscript("");
  };

  const submitAnswer = async () => {
    if (!transcript.trim()) {
      toast.error("Record or type an answer first");
      return;
    }
    setLoading(true);
    try {
      const response = await evaluateAnswer({
        question: currentQuestion,
        answer: transcript,
      });
      setFeedback(response.data.feedback);
      if (response.data.activity) {
        patchUser({ xp: response.data.activity.xp, streak: response.data.activity.streak });
        response.data.activity.newBadges?.forEach((b) => toast.info(`New badge unlocked: ${b.icon} ${b.name}`));
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 max-w-3xl">
        {!supported && (
          <div className="card p-4 flex items-start gap-3 border-amber-500/30 bg-amber-500/5">
            <FiAlertTriangle className="text-amber-400 shrink-0 mt-0.5" size={16} />
            <p className="text-sm text-amber-200">
              Your browser doesn't support the Web Speech API for voice input. You can still type your answer below —
              this works best in Chrome or Edge on desktop.
            </p>
          </div>
        )}

        {micError && (
          <div className="card p-4 flex items-start gap-3 border-rose-500/30 bg-rose-500/5">
            <FiAlertTriangle className="text-rose-400 shrink-0 mt-0.5" size={16} />
            <p className="text-sm text-rose-200">{micError}</p>
          </div>
        )}

        <div className="card p-6 text-center">
          <p className="text-xs text-slate-500 mb-2">Question {qIndex + 1} of {questions.length}</p>
          <h2 className="text-xl font-semibold text-slate-100 mb-5">{currentQuestion}</h2>

          <div className="flex items-center justify-center gap-3 mb-5">
            <button onClick={speakQuestion} className="btn-secondary">
              <FiVolume2 size={16} /> Hear Question
            </button>
            <button onClick={nextQuestion} className="btn-secondary">
              <FiRefreshCw size={16} /> Next Question
            </button>
          </div>

          <button
            onClick={toggleListening}
            className={`mx-auto flex items-center justify-center w-16 h-16 rounded-full transition-all duration-200 ${
              listening
                ? "bg-rose-500/20 border-2 border-rose-500 animate-pulse-soft"
                : "bg-accent-500/15 border-2 border-accent-500/40 hover:border-accent-500"
            }`}
          >
            {listening ? <FiMicOff className="text-rose-400" size={22} /> : <FiMic className="text-accent-400" size={22} />}
          </button>
          <p className="text-xs text-slate-500 mt-2">
            {listening ? "Listening... tap to stop (auto-resumes through pauses)" : "Tap to speak your answer"}
          </p>
        </div>

        <div className="card p-5">
          <label className="label">Your Answer (live transcript, editable)</label>
          <textarea
            rows={5}
            className="input-field resize-none"
            placeholder="Your spoken answer will appear here, or type directly..."
            value={transcript}
            onChange={handleManualChange}
          />
          <button onClick={submitAnswer} disabled={loading} className="btn-primary mt-3">
            {loading ? <FiLoader className="animate-spin" size={16} /> : <><FiSend size={15} /> Submit for AI Feedback</>}
          </button>

          {feedback && (
            <div className="mt-5 pt-4 border-t border-base-700">
              <FeedbackCard text={feedback} />
            </div>
          )}
        </div>
    </div>
  );
}

export default MockInterview;
