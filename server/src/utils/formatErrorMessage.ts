export const formatErrorMessage = (message: string) => {
  const cleanedMessage = message
    .replace(/"/g, "")
    .replace(/,/g, "")
    .replace(/body\./g, "")
    .replace(/query\./g, "")
    .replace(/params\./g, "")

    .replace(/expected one of /gi, "Choose from: ")
    .replace(/\|/g, ", ")
    .trim();

  console.log("Formatted Error Message:", cleanedMessage); // Debug log to verify formatting
  return cleanedMessage.charAt(0).toUpperCase() + cleanedMessage.slice(1);
};
