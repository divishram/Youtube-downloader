/**
 * Creates a debounced version of a callback function.
 *
 * @param callback - The callback function to be debounced.
 * @param delay - The delay (in milliseconds) before the callback is invoked.
 *               Defaults to 1000 milliseconds (1 second).
 * @returns A debounced version of the callback function.
 */
type CallbackFunction = (...args: any[]) => void;

function debounce(callback: CallbackFunction, delay: number = 1000): CallbackFunction {
    let timer: NodeJS.Timeout;
    /**
     * Debounced version of the callback function.
     *
     * @param args - The arguments to be passed to the callback function.
     */
    return (...args: any[]): void => {
        // Clear any existing timeout to reset the delay
        clearTimeout(timer);
        // Set a new timeout for the specified delay
        timer = setTimeout(() => {
            // Invoke the original callback with the provided arguments
            callback(...args);
        }, delay);
    };
}

export default debounce;