export function formatMessageTime(date) {
  try {
    if (!date) return "";
    const messageDate = new Date(date);
    if (isNaN(messageDate.getTime())) return "";

    const now = new Date();
    const isToday =
      messageDate.getDate() === now.getDate() &&
      messageDate.getMonth() === now.getMonth() &&
      messageDate.getFullYear() === now.getFullYear();

    const timeString = messageDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    if (isToday) {
      return timeString;
    } else {
      const dateString = messageDate.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
      return `${dateString} ${timeString}`;
    }
  } catch (error) {
    console.error("Error formatting message time:", error);
    return "";
  }
}
