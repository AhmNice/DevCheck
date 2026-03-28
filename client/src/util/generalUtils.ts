export const getPlainFirstLine = (markdown?: string) => {
  if (!markdown) return "";
  const firstLine =
    markdown.split("\n").find((line) => line.trim() !== "") || "";
  return firstLine.replace(/[#*_`>-]/g, "").trim();
};
