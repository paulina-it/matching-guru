"use client";

import React, { useState, useEffect } from "react";
import InputField from "@/components/InputField";
import { Button } from "@/components/ui/button";
import {
  AlgorithmType,
  CriterionType,
  MatchingCriteriaDto,
  ProgrammeYearDto,
  ProgrammeYearResponseDto,
} from "@/app/types/programmes";
import {
  createProgrammeYear,
  updateProgrammeYear,
  fetchProgrammeYear,
  fetchLatestProgrammeYear,
} from "@/app/api/programmes";
import toast from "react-hot-toast";
import { PulseLoader } from "react-spinners";
import { useRouter } from "next/navigation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import Image from "next/image";
import { uploadCertificateTemplate } from "@/app/api/upload";

interface ProgrammeYearFormProps {
  programmeId: number;
  programmeYearId?: number;
  error: string | null;
  editMode?: boolean;
}

const predefinedCriteria: string[] = [
  "Academic Field",
  "Availability",
  "Personality Fit",
  "Skills",
  "Gender",
  "Age",
  "Nationality",
  "Living Arrangement",
];

const ProgrammeYearForm: React.FC<ProgrammeYearFormProps> = ({
  programmeId,
  programmeYearId,
  error,
  editMode = false,
}) => {
  // FormData
  const [academicYear, setAcademicYear] = useState("");
  const [preferredAlgorithm, setPreferredAlgorithm] = useState<AlgorithmType>(
    AlgorithmType.GALE_SHAPLEY
  );
  const [criteria, setCriteria] = useState<MatchingCriteriaDto[]>(
    predefinedCriteria.map((name) => ({ name, weight: 0 }))
  );
  const [approvalType, setApprovalType] = useState<
    "MANUAL" | "THRESHOLD" | "AUTO"
  >("MANUAL");
  const [approvalThreshold, setApprovalThreshold] = useState<number>(70);
  const [strictAcademicStage, setStrictAcademicStage] = useState(true);
  const [strictCourseGroup, setStrictCourseGroup] = useState(true);
  const [collectFeedback, setCollectFeedback] = useState(false);
  const [surveyOpenDate, setSurveyOpenDate] = useState("");
  const [surveyCloseDate, setSurveyCloseDate] = useState("");
  const [surveyUrl, setSurveyUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [restrictSignupDates, setRestrictSignupDates] = useState(false);
  const [signupOpenDate, setSignupOpenDate] = useState("");
  const [signupCloseDate, setSignupCloseDate] = useState("");
  const [certificateTemplateUrl, setCertificateTemplateUrl] = useState<
    string | null
  >(null);

  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [certificatePreviewUrl, setCertificatePreviewUrl] = useState<
    string | null
  >(null);
  const [openAlgorithmInfo, setOpenAlgorithmInfo] = useState(false);
  const [openStrictnessInfo, setOpenStrictnessInfo] = useState(false);
  const [presetYear, setPresetYear] = useState<ProgrammeYearDto | null>(null);

  // Technical
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [swiperInstance, setSwiperInstance] = useState<any>(null);
  const [isAutoPrefilling, setIsAutoPrefilling] = useState(false);

  const totalWeight = criteria.reduce(
    (sum, criterion) => sum + criterion.weight,
    0
  );

  const nameToCriterionTypeMap: { [key: string]: CriterionType } = {
    "Academic Field": CriterionType.FIELD,
    Availability: CriterionType.AVAILABILITY,
    "Personality Fit": CriterionType.PERSONALITY,
    Skills: CriterionType.SKILLS,
    Gender: CriterionType.GENDER,
    Age: CriterionType.AGE,
    Nationality: CriterionType.NATIONALITY,
    "Living Arrangement": CriterionType.LIVING_ARRANGEMENT,
  };

  useEffect(() => {
    if (!editMode && programmeId) {
      fetchLatestProgrammeYear(programmeId).then((latestYear) => {
        if (latestYear) {
          setPresetYear(latestYear);
          console.log(latestYear);
        }
      });
    }

    if (editMode && programmeYearId) {
      setLoading(true);
      fetchProgrammeYear(programmeYearId)
        .then((data: ProgrammeYearResponseDto) => {
          console.log(data);
          setAcademicYear(data.academicYear);
          setPreferredAlgorithm(data.preferredAlgorithm as AlgorithmType);
          setCriteria(
            data.matchingCriteria!.map((criterion) => ({
              name:
                predefinedCriteria.find(
                  (c) => nameToCriterionTypeMap[c] === criterion.criterionType
                ) || criterion.name,
              weight: criterion.weight,
            }))
          );
          setStrictAcademicStage(data.strictAcademicStage ?? true);
          setStrictCourseGroup(data.strictCourseGroup ?? true);
          const backendApprovalType = data.matchApprovalType?.toUpperCase() as
            | "MANUAL"
            | "THRESHOLD"
            | "AUTO";
          setApprovalType(backendApprovalType);
          setApprovalThreshold(data.approvalThreshold || 70);
          setCollectFeedback(!!data.surveyUrl);
          setSurveyOpenDate(
            data.surveyOpenDate
              ? new Date(data.surveyOpenDate).toISOString().slice(0, 16)
              : ""
          );
          setIsActive(data.isActive ?? true);
          setStartDate(
            data.startDate
              ? new Date(data.startDate).toISOString().slice(0, 10)
              : ""
          );
          setEndDate(
            data.endDate
              ? new Date(data.endDate).toISOString().slice(0, 10)
              : ""
          );
          setRestrictSignupDates(
            !!(data.signupOpenDate || data.signupCloseDate)
          );
          setSignupOpenDate(
            data.signupOpenDate
              ? new Date(data.signupOpenDate).toISOString().slice(0, 16)
              : ""
          );
          setSignupCloseDate(
            data.signupCloseDate
              ? new Date(data.signupCloseDate).toISOString().slice(0, 16)
              : ""
          );

          setSurveyCloseDate(
            data.surveyCloseDate
              ? new Date(data.surveyCloseDate).toISOString().slice(0, 16)
              : ""
          );
          setSurveyUrl(data.surveyUrl || "");
          setCertificatePreviewUrl(data.certificateTemplateUrl || "");
          setCertificateTemplateUrl(data.certificateTemplateUrl || "");
        })
        .catch(() => {
          toast.error("Failed to load programme year details.");
        })
        .finally(() => setLoading(false));
    }
  }, [editMode, programmeYearId, programmeId]);

  const handleCriteriaChange = (
    index: number,
    field: keyof MatchingCriteriaDto,
    value: string | number
  ) => {
    const updatedCriteria = [...criteria];
    updatedCriteria[index] = {
      ...updatedCriteria[index],
      [field]: value,
    };
    setCriteria(updatedCriteria);
  };

  const goToNextSlide = () => {
    if (swiperInstance) swiperInstance.slideNext();
  };

  const goToPrevSlide = () => {
    if (swiperInstance) swiperInstance.slidePrev();
  };

  const handleCertificateFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only PNG or JPG files are allowed.");
      return;
    }

    setCertificateFile(file);
    setCertificatePreviewUrl(URL.createObjectURL(file));
  };

  const applyPreset = (presetName: string) => {
    setIsAutoPrefilling(true);
    const now = new Date();
    const currentYear = now.getFullYear();
    const nextYear = currentYear + 1;

    setAcademicYear(`${currentYear}/${nextYear}`);

    switch (presetName) {
      case "academicSupport":
        setPreferredAlgorithm(AlgorithmType.GALE_SHAPLEY);
        setStrictAcademicStage(true);
        setStrictCourseGroup(true);
        setApprovalType("MANUAL");
        setCriteria([
          { name: "Academic Field", weight: 30 },
          { name: "Availability", weight: 25 },
          { name: "Personality Fit", weight: 20 },
          { name: "Skills", weight: 15 },
          { name: "Gender", weight: 5 },
          { name: "Age", weight: 5 },
          { name: "Nationality", weight: 0 },
          { name: "Living Arrangement", weight: 0 },
        ]);
        break;

      case "careerMentoring":
        setPreferredAlgorithm(AlgorithmType.BRACE);
        setStrictAcademicStage(false);
        setStrictCourseGroup(false);
        setApprovalType("THRESHOLD");
        setApprovalThreshold(70);
        setCriteria([
          { name: "Skills", weight: 30 },
          { name: "Personality Fit", weight: 30 },
          { name: "Availability", weight: 20 },
          { name: "Academic Field", weight: 10 },
          { name: "Age", weight: 5 },
          { name: "Gender", weight: 5 },
          { name: "Nationality", weight: 0 },
          { name: "Living Arrangement", weight: 0 },
        ]);
        break;

      case "buddyScheme":
        setPreferredAlgorithm(AlgorithmType.GALE_SHAPLEY);
        setStrictAcademicStage(false);
        setStrictCourseGroup(false);
        setApprovalType("AUTO");
        setCriteria([
          { name: "Nationality", weight: 30 },
          { name: "Personality Fit", weight: 30 },
          { name: "Age", weight: 20 },
          { name: "Gender", weight: 10 },
          { name: "Availability", weight: 10 },
          { name: "Academic Field", weight: 0 },
          { name: "Skills", weight: 0 },
          { name: "Living Arrangement", weight: 0 },
        ]);
        break;

      case "largeCohort":
        setPreferredAlgorithm(AlgorithmType.BRACE);
        setStrictAcademicStage(false);
        setStrictCourseGroup(false);
        setApprovalType("AUTO");
        setCriteria([
          { name: "Availability", weight: 30 },
          { name: "Skills", weight: 25 },
          { name: "Personality Fit", weight: 25 },
          { name: "Academic Field", weight: 10 },
          { name: "Gender", weight: 5 },
          { name: "Age", weight: 5 },
          { name: "Nationality", weight: 0 },
          { name: "Living Arrangement", weight: 0 },
        ]);
        break;

      case "highTouch":
        setPreferredAlgorithm(AlgorithmType.GALE_SHAPLEY);
        setStrictAcademicStage(true);
        setStrictCourseGroup(true);
        setApprovalType("MANUAL");
        setCriteria([
          { name: "Academic Field", weight: 35 },
          { name: "Skills", weight: 25 },
          { name: "Personality Fit", weight: 20 },
          { name: "Availability", weight: 10 },
          { name: "Age", weight: 5 },
          { name: "Gender", weight: 5 },
          { name: "Nationality", weight: 0 },
          { name: "Living Arrangement", weight: 0 },
        ]);
        break;

      default:
        toast.error("Unknown preset selected");
    }

    toast.success("Preset applied! You can fine-tune the details below.");
    setTimeout(() => setIsAutoPrefilling(false), 200);
    goToNextSlide();
  };

  const uploadCertificateIfPresent = async (): Promise<string | null> => {
    if (!certificateFile) return certificateTemplateUrl ?? null;

    try {
      const uploadedUrl = await uploadCertificateTemplate(certificateFile);
      toast.success("Certificate template uploaded successfully.");
      setCertificateTemplateUrl(uploadedUrl);
      return uploadedUrl;
    } catch (error: any) {
      toast.error("Failed to upload certificate template.");
      return null;
    }
  };

  const populateFromPreviousYear = (prev: ProgrammeYearDto) => {
    setIsAutoPrefilling(true);
    const now = new Date();
    const currentYear = now.getFullYear();
    const nextYear = currentYear + 1;

    setAcademicYear(`${currentYear}/${nextYear}`);
    setPreferredAlgorithm(prev.preferredAlgorithm as AlgorithmType);
    setStrictAcademicStage(prev.strictAcademicStage ?? true);
    setStrictCourseGroup(prev.strictCourseGroup ?? true);
    setApprovalType(
      (prev.matchApprovalType?.toUpperCase() || "MANUAL") as
        | "MANUAL"
        | "THRESHOLD"
        | "AUTO"
    );
    setApprovalThreshold(prev.approvalThreshold || 70);
    setCollectFeedback(!!prev.surveyUrl);
    setSurveyOpenDate(
      prev.surveyOpenDate
        ? new Date(prev.surveyOpenDate).toISOString().slice(0, 16)
        : ""
    );
    setSurveyCloseDate(
      prev.surveyCloseDate
        ? new Date(prev.surveyCloseDate).toISOString().slice(0, 16)
        : ""
    );
    setSurveyUrl(prev.surveyUrl || "");

    setCriteria(
      prev.matchingCriteria!.map((criterion) => ({
        name:
          predefinedCriteria.find(
            (c) => nameToCriterionTypeMap[c] === criterion.criterionType
          ) || criterion.name,
        weight: criterion.weight,
      }))
    );
    setTimeout(() => setIsAutoPrefilling(false), 200);
    goToNextSlide();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAutoPrefilling) {
      return;
    }

    if (totalWeight !== 100) {
      toast.error("The total weight must add up to 100.");
      return;
    }

    setLoading(true);
    const uploadedUrl = await uploadCertificateIfPresent();

    if (collectFeedback && !surveyUrl) {
      toast.error("Please provide a survey form link.");
      setLoading(false);
      return;
    }

    if (certificateFile && !uploadedUrl) {
      toast.error("Certificate template upload failed. Please try again.");
      setLoading(false);
      return;
    }

    const formattedCriteria = criteria.map((criterion) => ({
      name: criterion.name,
      criterionType: nameToCriterionTypeMap[criterion.name],
      weight: criterion.weight,
    }));

    const formData = {
      programmeId,
      academicYear,
      customSettings: "",
      preferredAlgorithm,
      matchingCriteria: formattedCriteria,
      matchApprovalType: approvalType,
      approvalThreshold: approvalThreshold,
      strictAcademicStage,
      strictCourseGroup,
      isActive,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      surveyOpenDate: surveyOpenDate ? new Date(surveyOpenDate) : undefined,
      surveyCloseDate: surveyCloseDate ? new Date(surveyCloseDate) : undefined,
      surveyUrl,
      signupOpenDate:
        restrictSignupDates && signupOpenDate
          ? new Date(signupOpenDate)
          : undefined,
      signupCloseDate:
        restrictSignupDates && signupCloseDate
          ? new Date(signupCloseDate)
          : undefined,
      certificateTemplateUrl: uploadedUrl ?? "",
    };

    try {
      setLoading(true);
      if (editMode && programmeYearId) {
        await updateProgrammeYear(programmeYearId, formData);
        toast.success("Programme year updated successfully!");
      } else {
        await createProgrammeYear(formData);
        toast.success("Programme year created successfully!");
      }
      router.push(`/coordinator/programmes/${programmeId}`);
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !programmeId) {
    return (
      <div className="flex justify-center items-center h-screen">
        <PulseLoader color="#3498db" size={15} />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-5 max-w-[90vw] lg:max-w-[60vw] lg:min-w-[60vw] my-[5em] lg:my-10 "
    >
      <Swiper
        onSwiper={setSwiperInstance}
        allowTouchMove={true}
        className="h-full"
      >
        {/* Slide 0: Presets */}
        {!editMode && (
          <SwiperSlide className="bg-light dark:bg-dark dark:border dark:border-white/30 rounded p-6">
            <h2 className="text-2xl font-bold mb-4">
              Would you like to choose a Preset?
            </h2>
            <p className="text-muted-foreground mb-6">
              Select a preset to prefill common settings based on your programme
              type or cohort size. You can always change the values later.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => applyPreset("academicSupport")}
              >
                🎓 Academic Peer Support
              </Button>
              <Button
                variant="outline"
                onClick={() => applyPreset("careerMentoring")}
              >
                💼 Professional Growth
              </Button>
              <Button
                variant="outline"
                onClick={() => applyPreset("buddyScheme")}
              >
                🌍 Buddy / Cultural Mingle
              </Button>
              <Button
                variant="outline"
                onClick={() => applyPreset("largeCohort")}
              >
                🚀 Large Cohort (Fast Matching)
              </Button>
              <Button
                variant="outline"
                onClick={() => applyPreset("highTouch")}
              >
                🤝 High Touch / Manual Matching
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-6">
              Not sure? Select any option to explore and adjust it later or
              skip.
            </p>

            {presetYear && (
              <div className="mt-8 p-4 border rounded-md bg-muted/20 dark:bg-muted/30">
                <h3 className="text-lg font-semibold mb-2">
                  📋 Copy Settings from Previous Year?
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  We found an existing Programme Year. Would you like to copy
                  its settings to save time?
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setPresetYear(null)}>
                    No, Start Fresh
                  </Button>
                  <Button onClick={() => populateFromPreviousYear(presetYear)}>
                    Yes, Copy Settings
                  </Button>
                </div>
              </div>
            )}
            <Button
              onClick={(e) => {
                e.preventDefault();
                goToNextSlide();
              }}
              className="mt-6 w-full"
            >
              Next
            </Button>
          </SwiperSlide>
        )}
        {/* Slide 1: General Information */}
        <SwiperSlide className="bg-light dark:bg-dark dark:border dark:border-white/30 rounded p-6">
          <h2 className="text-2xl font-bold mb-4">
            Step 1: Programme Year Information
          </h2>
          <InputField
            id="academicYear"
            label="Academic Year"
            placeholder="e.g. 2024/2025"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            required
          />
          {/* Active ot Inactive */}
          <div className="my-5">
            {" "}
            <label className="block font-medium my-2 h3">
              Programme Year Status
            </label>
            <label className="flex items-center cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={isActive}
                onChange={() => setIsActive(!isActive)}
                className="mr-2"
              />
              <span className="font-medium text-gray-800 dark:text-light">
                Mark Programme Year as Active
              </span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">
                  Start Date (optional)
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border rounded px-4 py-2"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">
                  End Date (optional)
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border rounded px-4 py-2"
                />
              </div>
            </div>
          </div>
          <div className="my-6">
            <label className="block font-medium my-2 h3">Sign-up Period</label>
            <label className="flex items-center cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={restrictSignupDates}
                onChange={() => setRestrictSignupDates(!restrictSignupDates)}
                className="mr-2"
              />
              <span className="font-medium text-gray-800 dark:text-light">
                Restrict Participant Sign-up to Specific Dates
              </span>
            </label>

            {restrictSignupDates && (
              <div className="space-y-4 mt-2">
                <div>
                  <label className="block font-medium mb-1">
                    Signup Open Date
                  </label>
                  <input
                    type="datetime-local"
                    value={signupOpenDate}
                    onChange={(e) => setSignupOpenDate(e.target.value)}
                    className="w-full border rounded px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">
                    Signup Close Date
                  </label>
                  <input
                    type="datetime-local"
                    value={signupCloseDate}
                    onChange={(e) => setSignupCloseDate(e.target.value)}
                    className="w-full border rounded px-4 py-2"
                  />
                </div>
              </div>
            )}
            <div className="mb-4">
              <label className="block font-medium mb-2 mt-5 h3">
                Preferred Algorithm
              </label>
              <select
                value={preferredAlgorithm}
                onChange={(e) =>
                  setPreferredAlgorithm(e.target.value as AlgorithmType)
                }
                className="w-full border rounded px-4 py-2"
              >
                <option value={AlgorithmType.GALE_SHAPLEY}>Gale-Shapley</option>
                {/* <option value={AlgorithmType.COLLABORATIVE_FILTERING}>
            Collaborative Filtering
          </option> */}
                <option value={AlgorithmType.BRACE}>BRACE</option>
              </select>

              {/* 💡 Algorithm Explanation */}
              <Collapsible
                open={openAlgorithmInfo}
                onOpenChange={setOpenAlgorithmInfo}
              >
                <CollapsibleTrigger asChild>
                  <div className="cursor-pointer flex items-center gap-2 text-primary hover:text-primary-dark transition-colors duration-300 mt-4">
                    {openAlgorithmInfo ? (
                      <ChevronUp size={18} />
                    ) : (
                      <ChevronDown size={18} />
                    )}
                    <span className="underline underline-offset-4 font-medium">
                      Learn about matching algorithms
                    </span>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent className="mt-2 px-4 py-3 bg-muted/30 dark:bg-muted/20 rounded-md border text-sm leading-relaxed space-y-2 transition-all duration-300 ease-in-out overflow-hidden data-[state=closed]:max-h-0 data-[state=open]:max-h-[500px]">
                  <p>
                    <strong>Gale-Shapley (GS):</strong> Prioritises mentor
                    preferences. The soft version improves coverage
                    significantly (~71%) and is most suitable for small cohorts
                    (under 100 participants).
                  </p>
                  <p>
                    <strong>BRACE:</strong> Balances mentee needs, especially
                    effective in high-volume scenarios. Achieves ~72% match rate
                    in soft mode.
                  </p>
                  <p className="italic text-muted-foreground">
                    Both support multi-mentee matching. Choose based on
                    coordinator preference.
                  </p>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
          <div className="flex justify-between">
            {!editMode && (
              <Button
                type="button"
                onClick={() => goToPrevSlide()}
                className="w-[48%]"
              >
                Back
              </Button>
            )}
            <Button
              type="button"
              onClick={goToNextSlide}
              className={!editMode ? "w-[48%]" : "w-full"}
            >
              Next
            </Button>
          </div>
        </SwiperSlide>

        {/* Slide 2: Matching Criteria */}
        <SwiperSlide className="bg-light dark:bg-dark dark:border dark:border-white/30 rounded p-6">
          <h2 className="text-2xl font-bold mb-4">Step 2: Matching Criteria</h2>
          <p className="text-sm text-gray-600 dark:text-light/70 mb-2">
            Adjust the weights to prioritize specific criteria. The total weight
            must equal 100.
          </p>
          {criteria.map((criterion, index) => (
            <div key={index} className="flex items-center gap-4 mb-2">
              <input
                type="text"
                value={criterion.name}
                readOnly
                className="flex-grow border bg-gray-100 dark:bg-dark dark:border dark:border-white/30 rounded px-4 py-2 cursor-not-allowed"
              />
              <input
                type="number"
                placeholder="Weight"
                value={criterion.weight}
                onChange={(e) =>
                  handleCriteriaChange(index, "weight", Number(e.target.value))
                }
                className="w-20 border rounded px-4 py-2"
                min="0"
                max="100"
              />
            </div>
          ))}
          {/* Strict or Soft Matching */}
          <div className="mb-6">
            <h3 className="h3 mb-[-1em]">Matching Strictness Settings</h3>
            <div className="mb-4">
              {/* 🧩 Matching Strictness Help */}
              <Collapsible
                open={openStrictnessInfo}
                onOpenChange={setOpenStrictnessInfo}
              >
                <CollapsibleTrigger asChild>
                  <div className="cursor-pointer flex items-center gap-2 text-primary hover:text-primary-dark transition-colors duration-300 mt-7">
                    {openStrictnessInfo ? (
                      <ChevronUp size={18} />
                    ) : (
                      <ChevronDown size={18} />
                    )}
                    <span className="underline underline-offset-4 font-medium">
                      What does strict matching do?
                    </span>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent className="mt-2 px-4 py-3 bg-muted/30 dark:bg-muted/20 rounded-md border text-sm leading-relaxed space-y-2 transition-all duration-300 ease-in-out overflow-hidden data-[state=closed]:max-h-0 data-[state=open]:max-h-[500px]">
                  <p>
                    <strong>Strict Academic Stage:</strong> Matches mentors with
                    mentees from only one stage below (e.g., Year 2 → Year 1).
                  </p>
                  <p>
                    <strong>Strict Course Group:</strong> Restricts matching to
                    participants from the same course group.
                  </p>
                  <p className="italic text-muted-foreground">
                    Unchecking these options allows broader pairing and
                    increases match coverage.
                  </p>
                </CollapsibleContent>
              </Collapsible>
            </div>

            <div className="mb-4 mx-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={strictAcademicStage}
                  onChange={() => setStrictAcademicStage(!strictAcademicStage)}
                />
                <span className="ml-2 font-medium text-gray-700 dark:text-light">
                  Match Only Within Adjacent Academic Stages
                </span>
              </label>
            </div>

            <div className="mb-4 mx-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={strictCourseGroup}
                  onChange={() => setStrictCourseGroup(!strictCourseGroup)}
                />
                <span className="ml-2 font-medium text-gray-700 dark:text-light">
                  Match Only Within Same Course Group
                </span>
              </label>
            </div>
          </div>
          {/* Match Approval Settings */}
          <div className="mb-4">
            <label className="block font-medium my-2 h3">
              Match Approval Type
            </label>
            <select
              value={approvalType}
              onChange={(e) =>
                setApprovalType(
                  e.target.value as "MANUAL" | "THRESHOLD" | "AUTO"
                )
              }
              className="w-full border rounded px-4 py-2"
            >
              <option value="MANUAL">Manually approve all matches</option>
              <option value="THRESHOLD">
                Automatically approve matches above a threshold
              </option>
              <option value="AUTO">Automatically approve all matches</option>
            </select>
          </div>
          {approvalType === "THRESHOLD" && (
            <div className="mb-4">
              <label className="block font-medium my-2">
                Compatibility Score Threshold (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={approvalThreshold}
                onChange={(e) => setApprovalThreshold(Number(e.target.value))}
                className="w-full border rounded px-4 py-2"
              />
            </div>
          )}
          <div className="flex justify-between">
            <Button
              type="button"
              onClick={() => goToPrevSlide()}
              className="w-[48%]"
            >
              Back
            </Button>
            <Button type="button" onClick={goToNextSlide} className="w-[48%]">
              Next
            </Button>
          </div>
        </SwiperSlide>

        {/* Slide 3: Signup Dates */}
        <SwiperSlide className="bg-light dark:bg-dark dark:border dark:border-white/30 rounded p-6">
          <div className="mb-6 mx-4">
            <label className="block font-medium my-2 h3">
              Step 3: Feedback Collection
            </label>
            <label className="flex items-center cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={collectFeedback}
                onChange={() => setCollectFeedback(!collectFeedback)}
                className="mr-2"
              />
              <span className="font-medium text-gray-800 dark:text-light">
                Collect End-of-Programme Feedback
              </span>
            </label>

            {collectFeedback && (
              <div className="space-y-4 mt-2">
                <div>
                  <label className="block font-medium mb-1">
                    Survey Open Date
                  </label>
                  <input
                    type="datetime-local"
                    value={surveyOpenDate}
                    onChange={(e) => setSurveyOpenDate(e.target.value)}
                    className="w-full border rounded px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">
                    Survey Close Date
                  </label>
                  <input
                    type="datetime-local"
                    value={surveyCloseDate}
                    onChange={(e) => setSurveyCloseDate(e.target.value)}
                    className="w-full border rounded px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Form Link</label>
                  <input
                    type="url"
                    value={surveyUrl}
                    onChange={(e) => setSurveyUrl(e.target.value)}
                    placeholder="https://forms.gle/..."
                    className="w-full border rounded px-4 py-2"
                  />
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-between">
            <Button
              type="button"
              onClick={() => goToPrevSlide()}
              className="w-[48%]"
            >
              Back
            </Button>
            <Button type="button" onClick={goToNextSlide} className="w-[48%]">
              Next
            </Button>
          </div>
        </SwiperSlide>

        {/* Slide 4: Certificate and Submit */}
        <SwiperSlide className="bg-light dark:bg-dark dark:border dark:border-white/30 rounded p-6">
          <div className="mb-6 mx-4">
            <label className="block font-medium my-2 h3">
              Step 4: Certificate
            </label>
            <p className="text-sm text-muted-foreground mb-4">
              Please upload a certificate template image in PNG or JPG format.
              Make sure it includes an empty line or space where the
              participant’s name will be inserted.
            </p>
            <h3 className="h3">
              Here's an example, the rest of the data will be autofilled:
            </h3>
            <Image
              src={"/assets/placeholders/certificate-template.png"}
              alt="Certificate Preview"
              width={800}
              height={566}
              className="object-contain p-10"
            />
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              {/* Upload field */}
              <div className="flex-1">
                <label className="block font-medium mb-1">
                  Upload Certificate Template
                </label>
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  onChange={handleCertificateFileSelect}
                  className="w-full border rounded px-4 py-2 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/80 transition"
                />
              </div>

              {/* Preview */}
              <div className="flex-1">
                <label className="block font-medium mb-1">
                  Template Preview
                </label>
                <div className="border rounded overflow-hidden shadow max-w-full max-h-[300px]">
                  <Image
                    src={
                      certificatePreviewUrl ||
                      "/assets/placeholders/certificate-template.png"
                    }
                    alt="Certificate Preview"
                    width={800}
                    height={566}
                    className="object-contain"
                  />
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-3">
              Recommended size: 1600×1130px (4:3 ratio). Leave space for name
              insertion in the middle.
            </p>
          </div>

          <div className="flex justify-between items-center mt-6">
            <Button
              type="button"
              onClick={() => goToPrevSlide()}
              className="mr-2"
            >
              Back
            </Button>
            <Button type="submit" className="w-full">
              {editMode ? "Update Programme Year" : "Create Programme Year"}
            </Button>
          </div>
        </SwiperSlide>
      </Swiper>
    </form>
  );
};

export default ProgrammeYearForm;
