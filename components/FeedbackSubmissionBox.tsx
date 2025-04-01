"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { submitFeedbackCode } from "@/app/api/participant";

interface FeedbackSubmissionBoxProps {
  userId: number;
  programmeYearId: number;
  alreadySubmitted?: boolean;
}

const GOOGLE_FORM_URL = "https://forms.gle/your-google-form-link-here"; 

const FeedbackSubmissionBox: React.FC<FeedbackSubmissionBoxProps> = ({
  userId,
  programmeYearId,
  alreadySubmitted = false,
}) => {
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(alreadySubmitted);

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast.error("Please enter the secret code from the feedback form.");
      return;
    }

    setSubmitting(true);
    try {
      await submitFeedbackCode({
        userId,
        programmeYearId,
        secretCode: code.trim(),
      });

      toast.success("✅ Feedback recorded! You will receive your certificate.");
      setSubmitted(true);
    } catch (err: any) {
      toast.error(err.message || "❌ Failed to submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-4 rounded border border-green-400 bg-green-50 text-green-800 dark:bg-green-900 dark:border-green-600 dark:text-green-100 mt-6">
        ✅ Thank you! Your feedback has been recorded. You will receive a certificate soon.
      </div>
    );
  }

  return (
    <div className="mt-6 p-4 border rounded bg-light dark:bg-dark dark:border-white/20">
      <h4 className="font-semibold mb-2">🎓 Claim Your Participation Certificate</h4>
      <p className="text-sm mb-4 text-muted-foreground">
        1. Click the button below to open the feedback form in a new tab.<br />
        2. Submit your feedback and copy the secret code shown at the end.<br />
        3. Paste it here to unlock your certificate.
      </p>

      <a
        href={GOOGLE_FORM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="block mb-4"
      >
        <Button
          className="w-full text-lg py-6 font-bold bg-accent hover:bg-accent-hover text-white dark:bg-accent-dark dark:hover:bg-accent-darkHover transition"
        >
          ✍️ Fill Out Feedback Form
        </Button>
      </a>

      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          type="text"
          placeholder="Enter your secret code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={submitting}
        />
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Code"}
        </Button>
      </div>
    </div>
  );
};

export default FeedbackSubmissionBox;
