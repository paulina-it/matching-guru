export const formatText = (text: string | null | undefined): string => {
  if (!text) return "-";
  return text
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};
