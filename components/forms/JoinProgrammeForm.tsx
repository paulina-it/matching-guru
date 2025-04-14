"use client";

import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { BsArrowLeft } from "react-icons/bs";
import { Button } from "@/components/ui/button";
import { createParticipant } from "@/app/api/participant";
import { PulseLoader } from "react-spinners";
import toast from "react-hot-toast";
import {
  fetchMatchingCriteria,
  fetchEligibleCourses,
} from "@/app/api/programmes";
import { CourseDto } from "@/app/types/programmes";
import { ParticipantCreateDto } from "@/app/types/participant";
import { useAuth } from "@/app/context/AuthContext";
import { redirect } from "next/dist/server/api-utils";
import { useRouter } from "next/navigation";
import { UserResponseDto } from "@/app/types/auth";

interface MatchingCriterion {
  id: number;
  criterionType: string;
  weight: number;
}

const predefinedAcademicStages = [
  "Foundation Year",
  "First Year Undergraduate",
  "Second Year Undergraduate",
  "Placement Year",
  "Final Year Undergraduate",
  "Graduate",
  "Postgraduate Masters", 
  "Postgraduate PhD",     
];

const predefinedSkills = [
  "Communication",
  "Leadership",
  "Problem Solving",
  "Time Management",
  "Teamwork",
  "Critical Thinking",
  "Adaptability",
  "Networking",
  "Programming",
  "Analytical Skills",
  "Project Management",
  "Financial Literacy",
  "Writing and Research",
  "Marketing",
  "Design",
  "Foreign Languages",
  "Statistics",
  "Engineering",
  "Exam Preparation",
  "Note Taking",
  "Entrepreneurship",
  "Laboratory Techniques",
];

const predefinedNationalities = [
  "American",
  "Canadian",
  "Indian",
  "German",
  "French",
];

const predefinedLivingArrangements = [
  { value: "ON_CAMPUS", label: "On Campus" },
  { value: "PARENT_HOME", label: "At Parent's Home" },
  { value: "PRIVATE_RENT", label: "Private Rent" },
  {
    value: "STUDENT_ACCOMMODATION_OFFCAMPUS",
    label: "Off-campus Student Accommodation",
  },
  { value: "OTHER", label: "Other" },
];

const predefinedPersonalityTypes = [
  { value: "ARCHITECT_INTJ", label: "Architect (INTJ)" },
  { value: "LOGICIAN_INTP", label: "Logician (INTP)" },
  { value: "COMMANDER_ENTJ", label: "Commander (ENTJ)" },
  { value: "DEBATER_ENTP", label: "Debater (ENTP)" },
  { value: "ADVOCATE_INFJ", label: "Advocate (INFJ)" },
  { value: "MEDIATOR_INFP", label: "Mediator (INFP)" },
  { value: "PROTAGONIST_ENFJ", label: "Protagonist (ENFJ)" },
  { value: "CAMPAIGNER_ENFP", label: "Campaigner (ENFP)" },
  { value: "LOGISTICIAN_ISTJ", label: "Logistician (ISTJ)" },
  { value: "DEFENDER_ISFJ", label: "Defender (ISFJ)" },
  { value: "EXECUTIVE_ESTJ", label: "Executive (ESTJ)" },
  { value: "CONSUL_ESFJ", label: "Consul (ESFJ)" },
  { value: "VIRTUOSO_ISTP", label: "Virtuoso (ISTP)" },
  { value: "ADVENTURER_ISFP", label: "Adventurer (ISFP)" },
  { value: "ENTREPRENEUR_ESTP", label: "Entrepreneur (ESTP)" },
  { value: "ENTERTAINER_ESFP", label: "Entertainer (ESFP)" },
];

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const predefinedAgeGroups = ["18-20", "21-24", "25-29", "30+"];

const timeRanges = ["Morning", "Afternoon", "Evening", "Anytime", "Varies"];
const personalityTestLink =
  "https://www.16personalities.com/free-personality-test";

const JoinProgrammeForm: React.FC<{
  programmeYearId: number;
  programmeId: number;
  userProp: UserResponseDto;
}> = ({ programmeYearId, programmeId, userProp }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [swiperInstance, setSwiperInstance] = useState<any>(null);
  const [matchingCriteria, setMatchingCriteria] = useState<MatchingCriterion[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  // Form Data
  const [role, setRole] = useState<string>("mentee");
  const [menteeLimit, setMenteeLimit] = useState<number | null>(null);
  const [academicStage, setAcademicStage] = useState<string>(
    "First Year Undergraduate"
  );
  const [courseId, setCourseId] = useState<number | null | undefined>(user?.courseId);
  const [hadPlacement, setHadPlacement] = useState<boolean>(false);
  const [placementDescription, setPlacementDescription] = useState<string>("");
  const [placementInterest, setPlacementInterest] = useState<boolean>(false);
  const [eligibleCourses, setEligibleCourses] = useState<CourseDto[]>([]);
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [personalityType, setPersonalityType] = useState<string>(user?.personalityType ?? "");
  const [ageGroup, setAgeGroup] = useState<string>(user?.ageGroup ?? "");
  const [gender, setGender] = useState<string>(user?.gender ?? "");
  const [livingArrangement, setLivingArrangement] = useState<string>(user?.livingArrangement ?? "");
  const [meetingFrequency, setMeetingFrequency] = useState<string>("");
  const [availableTime, setAvailableTime] = useState<string>("");
  
  const toggleSkillSelection = (skill: string) => {
    setSkills((prevSkills) =>
      prevSkills.includes(skill)
        ? prevSkills.filter((s) => s !== skill)
        : [...prevSkills, skill]
    );
  };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [criteria, orgCourses] = await Promise.all([
          fetchMatchingCriteria(programmeYearId),
          fetchEligibleCourses(programmeId),
        ]);

        setMatchingCriteria(criteria);
        setEligibleCourses(
          orgCourses.sort((a, b) => a.name.localeCompare(b.name))
        );
      } catch (err: any) {
        toast.error("Error fetching data: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [programmeYearId, programmeId]);

  const goToNextSlide = () => {
    if (swiperInstance) swiperInstance.slideNext();
  };

  const goToPrevSlide = () => {
    if (swiperInstance) swiperInstance.slidePrev();
  };

  const handleSubmit = async () => {
    const participantData: ParticipantCreateDto = {
      userId: user!.id,
      programmeYearId: programmeYearId,
      role: role.toUpperCase() as "MENTOR" | "MENTEE",
      menteesNumber: role === "MENTOR" ? menteeLimit ?? null : null,
      academicStage: academicStage ?? null,
      hadPlacement:
        academicStage === "Placement Year" || hadPlacement ? true : null,
      placementDescription: hadPlacement ? placementDescription || null : null,
      placementInterest:
        academicStage === "Second Year Undergraduate"
          ? placementInterest ?? null
          : null,
      meetingFrequency: meetingFrequency || null,
      availableDays:
        availableDays.length > 0
          ? availableDays.map((day) => day.toUpperCase())
          : null,
      timeRange: availableTime ? availableTime.toUpperCase() : null,
      personalityType: personalityType || null,
      skills: skills.length > 0 ? skills : null,
      ageGroup: ageGroup || null,
      gender: gender || null,
      livingArrangement: livingArrangement || null,
    };

    if (!userProp.courseId) {
      participantData.courseId = courseId ?? null;
    }

    console.log("Submitting participant data:", participantData);

    try {
      setLoading(true);
      await createParticipant(participantData);
      toast.success("Successfully joined the programme!");
      router.push("/participant");
    } catch (err) {
      const error = err as Error;
      toast.error(`An error occurred: ${error.message}`);
      console.error("API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDaySelection = (day: string) => {
    if (availableDays.includes(day)) {
      setAvailableDays(availableDays.filter((d) => d !== day));
    } else {
      setAvailableDays([...availableDays, day]);
    }
  };

  const renderInput = (criterion: MatchingCriterion) => {
    switch (criterion.criterionType) {
      case "FIELD":
        if (userProp.courseId != null) {
          return null;
        }

        const filterCoursesByStage = () => {
          const stageToLevelMap: Record<string, string[]> = {
            "First Year Undergraduate": ["BA", "BSc", "BEng"],
            "Second Year Undergraduate": ["BA", "BSc", "BEng"],
            "Placement Year": ["BA", "BSc", "BEng"],
            "Final Year Undergraduate": ["BA", "BSc", "BEng"],
            Postgraduate: ["MSc", "MA", "PhD"],
          };

          const allowedLevels = stageToLevelMap[academicStage] || [];
          return eligibleCourses.filter((course) =>
            allowedLevels.some((level) => course.name.includes(level))
          );
        };

        const filteredCourses = filterCoursesByStage();

        return (
          <div>
            <label
              htmlFor={`criterion-${criterion.id}`}
              className="block text-md font-bold"
            >
              Academic Field (Weight: {criterion.weight}%)
            </label>
            <p className="text-sm">Select your course from the list below.</p>
            <select
              id={`criterion-${criterion.id}`}
              name={criterion.criterionType}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              onChange={(e) =>
                setCourseId(e.target.value ? Number(e.target.value) : null)
              }
              required
            >
              <option value="">Select a course</option>
              {filteredCourses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
        );

      case "AVAILABILITY":
        return (
          <div>
            <label
              htmlFor={`criterion-${criterion.id}`}
              className="block text-md font-bold"
            >
              Availability (Weight: {criterion.weight}%)
            </label>
            {/* Frequency */}
            <div className="mb-4">
              <p className="text-sm">How often are you available to meet?</p>
              <select
                value={meetingFrequency}
                onChange={(e) => setMeetingFrequency(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              >
                <option value="">Select frequency</option>
                <option value="Weekly">Weekly</option>
                <option value="Biweekly">Biweekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Less Often">Less Often</option>
              </select>
            </div>

            {/* Days of the Week */}
            <div className="mb-4">
              <p className="text-sm">
                Select the days you are free for meetings:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {daysOfWeek.map((day) => (
                  <label key={day} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      value={day}
                      checked={availableDays.includes(day)}
                      onChange={() => handleDaySelection(day)}
                    />
                    <span>{day}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Time Range */}
            <div className="mb-4">
              <p className="text-sm">What time of day are you free?</p>
              <select
                value={availableTime}
                onChange={(e) => setAvailableTime(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              >
                <option value="">Select time range</option>
                {timeRanges.map((range, index) => (
                  <option key={index} value={range}>
                    {range}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );

      case "PERSONALITY":
        if (userProp.personalityType != null) {
          return null;
        }
        return (
          <div>
            <label
              htmlFor={`criterion-${criterion.id}`}
              className="block text-md font-bold"
            >
              Personality Type (Weight: {criterion.weight}%)
            </label>
            <p className="text-sm text-black/70 dark:text-light/70">
              What best describes your personality? If unsure, you can take the
              test{" "}
              <a
                href={personalityTestLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                here
              </a>
              .
            </p>
            <select
              id="personalityType"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
              value={personalityType}
              onChange={(e) => setPersonalityType(e.target.value)}
            >
              <option value="">Select personality type</option>
              {predefinedPersonalityTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        );

      case "LIVING_ARRANGEMENT":
        if (userProp.livingArrangement != null) {
          return null; 
        }
        return (
          <div>
            <label
              htmlFor={`criterion-${criterion.id}`}
              className="block text-md font-bold"
            >
              Living Arrangement (Weight: {criterion.weight}%)
            </label>
            <p className="text-sm text-black/70 dark:text-light/70">
              Select your current living situation.
            </p>
            <select
              id={`criterion-${criterion.id}`}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
              value={livingArrangement}
              onChange={(e) => setLivingArrangement(e.target.value)}
            >
              <option value="">Select living arrangement</option>
              {predefinedLivingArrangements.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );

      case "SKILLS":
        return (
          <div>
            <label
              htmlFor={`criterion-${criterion.id}`}
              className="block text-md font-bold"
            >
              Skills (Weight: {criterion.weight}%)
            </label>
            <p className="text-sm text-black/70 dark:text-light/70">
              Select multiple skills that best describe your strengths and
              interests.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
              {predefinedSkills.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  className={`px-3 py-2 border rounded text-sm transition duration-300 ease-in-out ${
                    skills.includes(skill)
                      ? "bg-accent text-white shadow-lg"
                      : "bg-gray-200 text-black hover:bg-gray-300"
                  }`}
                  onClick={() => toggleSkillSelection(skill)}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        );

      case "GENDER":
        if (userProp.gender != null) {
          return null;
        }
        return (
          <div>
            <label
              htmlFor={`criterion-${criterion.id}`}
              className="block text-md font-bold"
            >
              Gender (Weight: {criterion.weight}%)
            </label>
            <p className="text-sm text-black/70 dark:text-light/70">
              Specify your preferred gender.
            </p>
            <select
              id={`criterion-${criterion.id}`}
              name={criterion.criterionType}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              onChange={(e) => setGender(e.target.value)}
              required
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Non-binary">Non-binary</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>
        );

      case "AGE":
        if (userProp.ageGroup != null) {
          return null;
        }
        return (
          <div>
            <label
              htmlFor={`criterion-${criterion.id}`}
              className="block text-md font-bold"
            >
              Age Group (Weight: {criterion.weight}%)
            </label>
            <p className="text-sm text-black/70 dark:text-light/70">
              Select your age group.
            </p>
            <select
              id={`criterion-${criterion.id}`}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value)}
            >
              <option value="">Select age group</option>
              {predefinedAgeGroups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>
        );

      case "NATIONALITY":
        if (userProp.nationality != null) {
          return null;
        }
        return (
          <div>
            <label
              htmlFor={`criterion-${criterion.id}`}
              className="block text-md font-bold"
            >
              Nationality (Weight: {criterion.weight}%)
            </label>
            <p className="text-sm text-black/70 dark:text-light/70">
              Select your nationality.
            </p>
            <select
              id={`criterion-${criterion.id}`}
              name={criterion.criterionType}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            >
              <option value="">Select nationality</option>
              {predefinedNationalities.map((nationality, index) => (
                <option key={index} value={nationality}>
                  {nationality}
                </option>
              ))}
            </select>
          </div>
        );

      default:
        return null;
    }
  };

  console.table(matchingCriteria);

  return (
    <div className="max-w-lg mx-auto ">
      {loading ? (
        <div className="flex justify-center items-center w-full h-screen">
          <PulseLoader color="#3498db" size={15} />
        </div>
      ) : (
        <Swiper
          onSwiper={setSwiperInstance}
          allowTouchMove={false}
          spaceBetween={50}
          slidesPerView={1}
          className="h-full"
        >
          {/* Slide 1: Role and Academic Stage */}
          <SwiperSlide className="bg-light dark:bg-dark dark:border dark:border-light/40 p-6 shadow rounded">
            <h2 className="text-xl font-bold mb-4">Step 1</h2>
            <div className="mb-4">
              <label className="block text-md font-bold">Select Role</label>
              <p className="text-black/70 dark:text-light/70 text-sm">
                If you wish to join as both mentor and mentee, please submit
                another form.
              </p>
              <div className="flex gap-4 mt-2">
                <Button
                  variant={role === "MENTOR" ? "default" : "outline"}
                  onClick={() => setRole("MENTOR")}
                >
                  Mentor
                </Button>
                <Button
                  variant={role === "MENTEE" ? "default" : "outline"}
                  onClick={() => setRole("MENTEE")}
                >
                  Mentee
                </Button>
              </div>
            </div>
            {role === "MENTOR" && (
              <div className="mb-4">
                <label className="block text-md font-bold">
                  Number of Mentees
                </label>
                <p className="text-sm text-black/70 dark:text-light/70">
                  Specify the maximum number of mentees you are willing to take.
                </p>
                <input
                  type="number"
                  min="1"
                  max="3"
                  value={menteeLimit || ""}
                  onChange={(e) => {
                    let value = Number(e.target.value);
                    if (value > 3) value = 3;
                    if (value < 1) value = 1;
                    setMenteeLimit(value);
                  }}
                  className="w-full border rounded px-4 py-2 mt-1"
                  placeholder="Enter number of mentees"
                />
              </div>
            )}
            <div className="mb-4">
              <label className="block text-md font-bold">Academic Stage</label>
              <select
                value={academicStage}
                onChange={(e) => setAcademicStage(e.target.value)}
                className="w-full border rounded px-4 py-2 mt-1"
              >
                {predefinedAcademicStages.map((stage, index) => (
                  <option key={index} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
            </div>
            <Button
              onClick={goToNextSlide}
              className="mt-4 w-full uppercase font-bold"
            >
              Next
            </Button>
          </SwiperSlide>

          {/* Slide 2: Placement Information */}
          {((academicStage === "Second Year Undergraduate" &&
            role.toUpperCase() == "MENTEE") ||
            academicStage === "Final Year Undergraduate") && (
            <SwiperSlide className="bg-light dark:bg-dark dark:border dark:border-light/40 p-6 shadow rounded">
              <h2 className="text-xl font-bold mb-4">Placement Information</h2>
              {academicStage === "Final Year Undergraduate" && (
                <div className="mb-4">
                  <label className="block text-md font-bold">
                    Have you completed a placement?
                  </label>
                  <div className="flex gap-4 mt-2">
                    <button
                      type="button"
                      onClick={() => setHadPlacement(true)}
                      className={`px-4 py-2 border rounded ${
                        hadPlacement
                          ? "bg-primary dark:bg-primary-dark text-white"
                          : "bg-white dark:bg-dark"
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setHadPlacement(false)}
                      className={`px-4 py-2 border rounded ${
                        hadPlacement === false
                          ? "bg-primary dark:bg-primary-dark text-white"
                          : "bg-white dark:bg-dark"
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>
              )}
              {academicStage === "Second Year Undergraduate" && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Placement Interest</h2>

                  {/* Do you want a placement? */}
                  <div className="mb-4">
                    <label className="block text-md font-bold">
                      Are you interested in a placement?
                    </label>
                    <div className="flex gap-4 mt-2">
                      <button
                        type="button"
                        onClick={() => setPlacementInterest(true)}
                        className={`px-4 py-2 border rounded ${
                          placementInterest
                            ? "bg-primary dark:bg-primary-dark text-white"
                            : "bg-white dark:bg-dark"
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setPlacementInterest(false)}
                        className={`px-4 py-2 border rounded ${
                          placementInterest === false
                            ? "bg-primary dark:bg-primary-dark text-white"
                            : "bg-white dark:bg-dark"
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  {/* Desired Placement Description */}
                  {placementInterest && (
                    <div className="mb-4">
                      <label className="block text-md font-bold">
                        What industry or type of placement are you looking for?
                      </label>
                      <textarea
                        className="w-full border rounded px-4 py-2 mt-1"
                        placeholder="Describe your desired placement (e.g., Tech industry, Software Development)"
                        value={placementDescription}
                        onChange={(e) =>
                          setPlacementDescription(e.target.value)
                        }
                      />
                    </div>
                  )}
                </div>
              )}

              {academicStage === "Final Year Undergraduate" && hadPlacement && (
                <div className="mb-4">
                  <label className="block text-md font-bold">
                    Describe your placement
                  </label>
                  <textarea
                    className="w-full border rounded px-4 py-2 mt-1"
                    placeholder="Describe your placement experience"
                    value={placementDescription}
                    onChange={(e) => setPlacementDescription(e.target.value)}
                  />
                </div>
              )}
              <div className="flex items-center justify-between gap-6">
                <Button
                  onClick={goToPrevSlide}
                  className="flex items-center space-x-2"
                  variant="outline"
                >
                  <BsArrowLeft className="text-xl text-gray-700 hover:text-black" />
                </Button>
                <Button
                  onClick={goToNextSlide}
                  className="mt-4 w-full uppercase font-bold"
                >
                  Next
                </Button>
              </div>
            </SwiperSlide>
          )}

          {/* Slide 3: Criteria Based */}
          <SwiperSlide className="bg-light dark:bg-dark dark:border dark:border-light/40 p-6 shadow rounded">
            <h2 className="text-xl font-bold mb-4">Step 2</h2>
            {matchingCriteria
              .filter((criterion) => criterion.weight > 0)
              .map((criterion, index) => (
                <div key={index} className="mb-4">
                  {renderInput(criterion)}
                </div>
              ))}
            <div className="flex items-center justify-between gap-6">
              <Button
                onClick={goToPrevSlide}
                className="flex items-center space-x-2"
                variant="outline"
              >
                <BsArrowLeft className="text-xl text-gray-700 hover:text-black" />
              </Button>
              <Button
                onClick={handleSubmit}
                className="w-full uppercase font-bold"
              >
                Submit
              </Button>
            </div>
          </SwiperSlide>
        </Swiper>
      )}
    </div>
  );
};

export default JoinProgrammeForm;
