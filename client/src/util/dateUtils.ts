export const formatDate = (dateString: string | Date): string => {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const inputDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  if (inputDate.getTime() === today.getTime()) return "Today";
  if (inputDate.getTime() === yesterday.getTime()) return "Yesterday";
  if (inputDate.getTime() === tomorrow.getTime()) return "Tomorrow";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatDateTime = (dateString: string | Date): string => {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const inputDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  if (inputDate.getTime() === today.getTime()) {
    return `Today at ${date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })}`;
  }

  if (inputDate.getTime() === yesterday.getTime()) {
    return `Yesterday at ${date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })}`;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
