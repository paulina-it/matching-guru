'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getDetailedParticipantsByProgrammeYearId } from '@/app/api/participant'
import { ParticipantResponseDto } from '@/app/types/participant'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const ParticipantsInProgrammeYear: React.FC = () => {
  const params = useParams<{ yearId: string }>()
  const router = useRouter()
  const programmeYearId = parseInt(params?.yearId ?? '', 10)

  const [participants, setParticipants] = useState<ParticipantResponseDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [submittedSearch, setSubmittedSearch] = useState('')

  useEffect(() => {
    const fetchParticipants = async () => {
      setLoading(true)
      try {
        const data = await getDetailedParticipantsByProgrammeYearId(programmeYearId)
        setParticipants(data)
        setError(null)
      } catch (err: any) {
        setError(err.message || 'Failed to fetch participants')
        setParticipants([])
      } finally {
        setLoading(false)
      }
    }

    if (!isNaN(programmeYearId)) {
      fetchParticipants()
    }
  }, [programmeYearId])

  const handleSearchSubmit = () => setSubmittedSearch(searchQuery)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearchSubmit()
  }

  const filteredParticipants = participants.filter((p) =>
    [p.userName, p.userEmail].some((field) =>
      field?.toLowerCase().includes(submittedSearch.toLowerCase())
    )
  )

  const mentors = filteredParticipants.filter((p) => p.role === 'MENTOR')
  const mentees = filteredParticipants.filter((p) => p.role === 'MENTEE')

  const renderParticipantDetails = (participant: ParticipantResponseDto) => (
    <ul className="text-sm text-gray-600 mt-2 space-y-1 list-disc list-inside">
      <li>Course: {participant.userCourseName}</li>
      <li>Personality: {participant.userPersonalityType}</li>
      <li>Living: {participant.userLivingArrangement}</li>
      <li>Skills: {participant.skills?.join(', ') || 'None'}</li>
      <li>Availability: {participant.availableDays?.join(', ') || 'None'}</li> 
    </ul>
  )

  return (
    <div className="mt-6 min-w-[65vw] bg-white rounded p-6 shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Participants</h2>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <Input
          type="text"
          placeholder="Search by name or email"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="lg:w-1/3"
        />
        <Button onClick={handleSearchSubmit}>Search</Button>
      </div>

      {loading ? (
        <p className="text-gray-600">Loading participants...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : participants.length === 0 ? (
        <p className="text-gray-600">No participants found.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mentors */}
          <div>
            <h3 className="text-xl font-semibold mb-3">Mentors</h3>
            {mentors.length === 0 ? (
              <p className="text-gray-500">No mentors found.</p>
            ) : (
              <ul className="space-y-3">
                {mentors.map((mentor) => (
                  <li
                    key={mentor.id}
                    className="border rounded-md p-4 flex flex-col gap-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{mentor.userName}</p>
                        <p className="text-sm text-gray-500">
                          {mentor.academicStage} | {mentor.userEmail} | Mentees Count: {mentor.menteesNumber}
                        </p>
                        {renderParticipantDetails(mentor)}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={`text-sm px-3 py-1 rounded-full ${
                            mentor.isMatched
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {mentor.isMatched ? 'Matched' : 'Unmatched'}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Mentees */}
          <div>
            <h3 className="text-xl font-semibold mb-3">Mentees</h3>
            {mentees.length === 0 ? (
              <p className="text-gray-500">No mentees found.</p>
            ) : (
              <ul className="space-y-3">
                {mentees.map((mentee) => (
                  <li
                    key={mentee.id}
                    className="border rounded-md p-4 flex flex-col gap-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{mentee.userName}</p>
                        <p className="text-sm text-gray-500">
                          {mentee.academicStage} | {mentee.userEmail}
                        </p>
                        {renderParticipantDetails(mentee)}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={`text-sm px-3 py-1 rounded-full ${
                            mentee.isMatched
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {mentee.isMatched ? 'Matched' : 'Unmatched'}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/participants/${mentee.userId}`)}
                        >
                          View Info
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ParticipantsInProgrammeYear
