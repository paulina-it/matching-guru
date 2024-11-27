"use client";

import React, { useEffect, useState, useRef } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Button } from "../ui/button";
import { courses } from "../../app/data/courses";

type CourseItem = {
  id: string;
  name: string;
  type: string;
};

type Group = {
  id: string;
  name: string;
  courses: CourseItem[];
};

const undergraduateCourses: CourseItem[] = courses.undergraduate_courses.map(
  (course, index) => ({
    id: `ug-${index + 1}`,
    name: course,
    type: "COURSE",
  })
);

const groupCriteria = [
  { keyword: "Business", groupName: "Business" },
  { keyword: "Engineering", groupName: "Engineering" },
  { keyword: "Science", groupName: "Science" },
  { keyword: "Economics", groupName: "Economics" },
];

const GroupCourses: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [ungroupedCourses, setUngroupedCourses] = useState<CourseItem[]>([]);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    course: CourseItem | null;
    x: number;
    y: number;
  } | null>(null);

  const contextMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grouped: Record<string, Group> = {};
    const ungrouped: CourseItem[] = [];

    undergraduateCourses.forEach((course) => {
      let addedToGroup = false;
      for (const { keyword, groupName } of groupCriteria) {
        if (course.name.includes(keyword)) {
          if (!grouped[groupName]) {
            grouped[groupName] = { id: groupName, name: groupName, courses: [] };
          }
          grouped[groupName].courses.push(course);
          addedToGroup = true;
          break;
        }
      }

      if (!addedToGroup) {
        ungrouped.push(course);
      }
    });

    setGroups(Object.values(grouped));
    setUngroupedCourses(ungrouped);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        contextMenu &&
        contextMenuRef.current &&
        !contextMenuRef.current.contains(e.target as Node)
      ) {
        setContextMenu(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [contextMenu]);

  const moveCourse = (course: CourseItem, targetGroupId: string | null) => {
    setGroups((prevGroups) =>
      prevGroups.map((group) => ({
        ...group,
        courses: group.courses.filter((c) => c.id !== course.id),
      }))
    );

    setUngroupedCourses((prevCourses) =>
      prevCourses.filter((c) => c.id !== course.id)
    );

    if (targetGroupId === null) {
      setUngroupedCourses((prevCourses) => [...prevCourses, course]);
    } else {
      setGroups((prevGroups) =>
        prevGroups.map((group) =>
          group.id === targetGroupId
            ? { ...group, courses: [...group.courses, course] }
            : group
        )
      );
    }
    setContextMenu(null);
  };

  const renameGroup = (groupId: string, newName: string) => {
    setGroups((prevGroups) =>
      prevGroups.map((group) =>
        group.id === groupId ? { ...group, name: newName } : group
      )
    );
    setEditingGroup(null);
  };

  const Course: React.FC<{ course: CourseItem }> = ({ course }) => {
    const [, dragRef] = useDrag(() => ({
      type: "COURSE",
      item: course,
    }));

    const handleRightClick = (e: React.MouseEvent) => {
      e.preventDefault();
      setContextMenu({
        course,
        x: e.pageX,
        y: e.pageY,
      });
    };

    return (
      <div
        ref={dragRef}
        onContextMenu={handleRightClick}
        className="p-2 border rounded bg-white shadow my-2"
        style={{ cursor: "move" }}
      >
        {course.name}
      </div>
    );
  };

  const GroupDropArea: React.FC<{ group: Group }> = ({ group }) => {
    const [{ isOver }, dropRef] = useDrop({
      accept: "COURSE",
      drop: (course: CourseItem) => moveCourse(course, group.id),
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    });

    const [tempGroupName, setTempGroupName] = useState(group.name);

    const handleSave = () => {
      if (tempGroupName.trim()) {
        renameGroup(group.id, tempGroupName);
      }
    };

    return (
      <div
        ref={dropRef as React.Ref<HTMLDivElement>}
        className={`p-4 border rounded my-2 ${
          isOver ? "bg-gray-200" : "bg-gray-50"
        }`}
      >
        {editingGroup === group.id ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={tempGroupName}
              onChange={(e) => setTempGroupName(e.target.value)}
              className="p-2 border rounded flex-grow"
            />
            <Button onClick={handleSave}>Save</Button>
            <Button onClick={() => setEditingGroup(null)}>Cancel</Button>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">{group.name}</h3>
            <Button onClick={() => setEditingGroup(group.id)}>Edit</Button>
          </div>
        )}
        {group.courses.map((course) => (
          <Course key={course.id} course={course} />
        ))}
      </div>
    );
  };

  const UngroupedCourses: React.FC = () => {
    const [{ isOver }, dropRef] = useDrop({
      accept: "COURSE",
      drop: (course: CourseItem) => moveCourse(course, null),
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    });

    return (
      <div
        ref={dropRef as React.Ref<HTMLDivElement>}
        className={`p-4 border rounded my-2 ${
          isOver ? "bg-gray-200" : "bg-gray-50"
        }`}
      >
        <h3 className="font-semibold">Ungrouped Courses</h3>
        {ungroupedCourses.map((course) => (
          <Course key={course.id} course={course} />
        ))}
      </div>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Group Courses</h1>
        <UngroupedCourses />
        {groups.map((group) => (
          <GroupDropArea key={group.id} group={group} />
        ))}

        {contextMenu && (
          <div
            ref={contextMenuRef}
            style={{
              position: "absolute",
              top: contextMenu.y,
              left: contextMenu.x,
              background: "white",
              border: "1px solid gray",
              padding: "8px",
              zIndex: 1000,
            }}
          >
            {groups.map((group) => (
              <div
                key={group.id}
                onClick={() => moveCourse(contextMenu.course!, group.id)}
                className="cursor-pointer hover:bg-gray-200 p-1"
              >
                Move to {group.name}
              </div>
            ))}
            <div
              onClick={() => moveCourse(contextMenu.course!, null)}
              className="cursor-pointer hover:bg-gray-200 p-1"
            >
              Move to Ungrouped Courses
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default GroupCourses;
