import * as Papa from "papaparse";
import * as XLSX from "xlsx";

const uploadFile = (file: File) => {
  const reader = new FileReader();

  reader.onload = (e) => {
    const fileContent = e.target?.result;
    if (file.name.endsWith(".csv")) {
      const parsedData = Papa.parse(fileContent as string, { header: true });
      processParsedData(parsedData.data);
    } else if (file.name.endsWith(".xlsx")) {
      const workbook = XLSX.read(fileContent, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      processParsedData(sheetData);
    }
  };

  if (file.name.endsWith(".xlsx")) {
    reader.readAsBinaryString(file);
  } else {
    reader.readAsText(file);
  }
};

const processParsedData = (data: any[]) => {
  const formattedGroups = data.reduce((groups, row) => {
    const { CourseGroup, Type, CourseName } = row;
    if (!groups[CourseGroup]) {
      groups[CourseGroup] = { name: CourseGroup, type: Type, courses: [] };
    }
    groups[CourseGroup].courses.push(CourseName);
    return groups;
  }, {});

  setCourseGroups(Object.values(formattedGroups));
  toast.success("File uploaded successfully!");
};
