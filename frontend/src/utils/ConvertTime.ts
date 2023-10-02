/**
 * Formats a duration string into a string displaying minutes and seconds.
 *
 * @param {string} duration - The duration string in seconds to format.
 * @returns {string} A formatted string in the "mm:ss" format representing minutes and seconds.
 *                   Returns "Invalid Duration" for invalid input.
 */

function formatTime(duration: string): string {
  const seconds = parseInt(duration);

  if (isNaN(seconds)) {
    // Handle invalid input gracefully
    return "Invalid Duration";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const formattedMinutes = minutes.toString();
  const formattedSeconds = remainingSeconds.toString().padStart(2, "0");
  return `${formattedMinutes}:${formattedSeconds}`;
}

export default formatTime;
