"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import {
  fetchCourseGroupsByOrganisationId,
  deleteCourse,
  deleteCourseGroup,
  updateCourse,
  updateCourseGroup,
} from "@/app/api/courses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster, toast } from "react-hot-toast";

interface Course {
  id: number;
  name: string;
  type: string;
  duration: number;
  groupId: number;
}

interface CourseGroup {
  id: number;
  name: string;
  courses: Course[];
}

export default function EditCoursesPage() {
  const { user } = useAuth();
  const [courseGroups, setCourseGroups] = useState<CourseGroup[]>([]);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<number | null>(null);
  const [editedGroupName, setEditedGroupName] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.organisationId) {
      loadCourses(user.organisationId);
    }
  }, [user]);

  const loadCourses = async (organisationId: number) => {
    try {
      setLoading(true);
      const groups = await fetchCourseGroupsByOrganisationId(organisationId);
      setCourseGroups(groups);
    } catch (error) {
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingCourse) {
      setEditingCourse({ ...editingCourse, [e.target.name]: e.target.value });
    }
  };

  const handleUpdate = async () => {
    if (!editingCourse) return;
    try {
      await updateCourse(editingCourse.id, editingCourse);
      toast.success("Course updated");
      setEditingCourse(null);
      if (user?.organisationId) loadCourses(user.organisationId);
    } catch (err) {
      toast.error("Failed to update course");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteCourse(id);
      toast.success("Course deleted");
      if (user?.organisationId) loadCourses(user.organisationId);
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to delete course";
      toast.error(errorMessage);
    }
  };

  const handleDeleteGroup = async (groupId: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this course group? This will remove all associated courses."
      )
    )
      return;
    try {
      await deleteCourseGroup(groupId);
      toast.success("Course group deleted");
      if (user?.organisationId) loadCourses(user.organisationId);
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to delete group";
      toast.error(errorMessage);
    }
  };

  const handleGroupNameEdit = (groupId: number, currentName: string) => {
    setEditingGroupId(groupId);
    setEditedGroupName(currentName);
  };

  const handleGroupNameSave = async (groupId: number) => {
    try {
      await updateCourseGroup(groupId, { name: editedGroupName });
      toast.success("Group name updated");
      setEditingGroupId(null);
      if (user?.organisationId) loadCourses(user.organisationId);
    } catch (err) {
      toast.error("Failed to update group name");
    }
  };

  return (
    <div className="p-6 my-[4em] bg-white rounded min-w-[60vw] mx-auto">
      <Toaster position="top-right" />
      <h1 className="text-3xl font-bold mb-6">Edit Courses</h1>
      {courseGroups.map((group) => (
        <div key={group.id} className="mb-8">
          <div className="flex items-center justify-between mb-2 gap-2">
            {editingGroupId === group.id ? (
              <>
                <Input
                  value={editedGroupName}
                  onChange={(e) => setEditedGroupName(e.target.value)}
                  className="flex-1"
                />
                <Button size="sm" onClick={() => handleGroupNameSave(group.id)}>
                  Save
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingGroupId(null)}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold flex-1">{group.name}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleGroupNameEdit(group.id, group.name)}
                >
                  Rename
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDeleteGroup(group.id)}
                  size="sm"
                >
                  Delete Group
                </Button>
              </>
            )}
          </div>
          <ul className="space-y-2">
            {group.courses.map((course) => (
              <li key={course.id} className="flex gap-2 items-center">
                {editingCourse?.id === course.id ? (
                  <>
                    <Input
                      name="name"
                      value={editingCourse.name || ""}
                      onChange={handleChange}
                      placeholder="Course name"
                    />
                    <Button onClick={handleUpdate} size="sm">
                      Save
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setEditingCourse(null)}
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="flex-1">{course.name} </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(course)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(course.id)}
                    >
                      Delete
                    </Button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
