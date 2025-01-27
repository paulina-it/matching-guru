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

interface MatchingCriterion {
  id: number;
  criterionType: string;
  weight: number;
}

const predefinedAcademicStages = [
  "First Year Undergraduate",
  "Second Year Undergraduate",
  "Placement Year",
  "Final Year Undergraduate",
  "Postgraduate",
];

const predefinedSkills = [
  "Leadership",
  "Time Management",
  "Teamwork",
  "Communication",
  "Problem Solving",
  "Technical Skills",
];

const predefinedNationalities = [
  "American",
  "Canadian",
  "Indian",
  "German",
  "French",
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

const timeRanges = ["Morning", "Afternoon", "Evening", "Anytime", "Varies"];

const JoinProgrammeForm: React.FC<{
  programmeYearId: number;
  programmeId: number;
  userProp: { organisationId: number; course?: string };
}> = ({ programmeYearId, programmeId, userProp }) => {
  const { user } = useAuth();
  const [swiperInstance, setSwiperInstance] = useState<any>(null);
  const [role, setRole] = useState<string>("mentee");
  const [menteeLimit, setMenteeLimit] = useState<number | null>(null);
  const [academicStage, setAcademicStage] = useState<string>(
    "First Year Undergraduate"
  );
  const [hadPlacement, setHadPlacement] = useState<boolean>(false);
  const [placementDescription, setPlacementDescription] = useState<string>("");
  const [placementInterest, setPlacementInterest] = useState<boolean>(false);

  const [matchingCriteria, setMatchingCriteria] = useState<MatchingCriterion[]>(
    []
  );
  const [eligibleCourses, setEligibleCourses] = useState<CourseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [meetingFrequency, setMeetingFrequency] = useState<string>("");
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [availableTime, setAvailableTime] = useState<string>("");

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
        setError(err.message);
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
      userId: user.id,
      programmeYearId: programmeYearId,
      role: role === "mentor" ? "MENTOR" : "MENTEE",
      menteesNumber: role === "mentor" ? menteeLimit : null,
      academicStage: academicStage,
      hadPlacement:
        academicStage === "Placement Year" || hadPlacement ? true : null,
      placementDescription: hadPlacement ? placementDescription : null,
      placementInterest:
        academicStage === "Second Year Undergraduate"
          ? placementInterest
          : null,
      meetingFrequency: meetingFrequency || null,
      availableDays: availableDays.length > 0 ? availableDays : null,
      availableTime: availableTime || null,
      course: userProp.course || null,
      personality: null,
      skills: null,
      genderPreference: null,
      age: null,
      nationality: null,
    };

    try {
      await createParticipant(participantData);
      toast.success("Successfully joined the programme!");
    } catch (err) {
      const error = err as Error;
      toast.error(`An error occurred: ${error.message}`);
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

        if (userProp.course == null) {
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
                required
              >
                <option value="">Select a course</option>
                {filteredCourses.map((course) => (
                  <option key={course.id} value={course.name}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>
          );
        }

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
        return (
          <div>
            <label
              htmlFor={`criterion-${criterion.id}`}
              className="block text-md font-bold"
            >
              Personality Type (Weight: {criterion.weight}%)
            </label>
            <p className="text-sm text-black/70">
              What best describes your personality?
            </p>
            <select
              id={`criterion-${criterion.id}`}
              name={criterion.criterionType}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            >
              <option value="">Select personality type</option>
              <option value="Introvert">Introvert</option>
              <option value="Extrovert">Extrovert</option>
              <option value="Ambivert">Ambivert</option>
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
            <p className="text-sm text-black/70">
              Select skills you would like to develop.
            </p>
            <select
              id={`criterion-${criterion.id}`}
              name={criterion.criterionType}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              multiple
              required
            >
              {predefinedSkills.map((skill, index) => (
                <option key={index} value={skill}>
                  {skill}
                </option>
              ))}
            </select>
          </div>
        );

      case "GENDER":
        return (
          <div>
            <label
              htmlFor={`criterion-${criterion.id}`}
              className="block text-md font-bold"
            >
              Gender (Weight: {criterion.weight}%)
            </label>
            <p className="text-sm text-black/70">
              Specify your preferred gender.
            </p>
            <select
              id={`criterion-${criterion.id}`}
              name={criterion.criterionType}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
        return (
          <div>
            <label
              htmlFor={`criterion-${criterion.id}`}
              className="block text-md font-bold"
            >
              Age (Weight: {criterion.weight}%)
            </label>
            <p className="text-sm text-black/70">Enter your age.</p>
            <input
              id={`criterion-${criterion.id}`}
              name={criterion.criterionType}
              type="number"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter your age"
              required
            />
          </div>
        );

      case "NATIONALITY":
        return (
          <div>
            <label
              htmlFor={`criterion-${criterion.id}`}
              className="block text-md font-bold"
            >
              Nationality (Weight: {criterion.weight}%)
            </label>
            <p className="text-sm text-black/70">Select your nationality.</p>
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

  return (
    <div className="max-w-lg mx-auto bg-white p-6 shadow rounded">
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
          <SwiperSlide>
            <h2 className="text-xl font-bold mb-4">Step 1</h2>
            <div className="mb-4">
              <label className="block text-md font-bold">Select Role</label>
              <p className="text-black/70 text-sm">
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
                <p className="text-sm text-black/70">
                  Specify the maximum number of mentees you are willing to take.
                </p>
                <input
                  type="number"
                  min="1"
                  value={menteeLimit || ""}
                  onChange={(e) => setMenteeLimit(Number(e.target.value))}
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
          {(academicStage === "Second Year Undergraduate" ||
            academicStage === "Final Year Undergraduate") && (
            <SwiperSlide>
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
                        hadPlacement ? "bg-blue-500 text-white" : "bg-white"
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setHadPlacement(false)}
                      className={`px-4 py-2 border rounded ${
                        hadPlacement === false
                          ? "bg-blue-500 text-white"
                          : "bg-white"
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
                            ? "bg-blue-500 text-white"
                            : "bg-white"
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setPlacementInterest(false)}
                        className={`px-4 py-2 border rounded ${
                          placementInterest === false
                            ? "bg-blue-500 text-white"
                            : "bg-white"
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
          <SwiperSlide>
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
