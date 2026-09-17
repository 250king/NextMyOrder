export type DebouncedCallback<Args extends unknown[]> = {
    (...args: Args): void;
    cancel: () => void;
};

export const debounce = <Args extends unknown[]>(
    callback: (...args: Args) => void,
    delay: number
): DebouncedCallback<Args> => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const debounced = ((...args: Args) => {
        if (timer !== undefined) {
            clearTimeout(timer);
        }

        timer = setTimeout(() => {
            timer = undefined;
            callback(...args);
        }, delay);
    }) as DebouncedCallback<Args>;

    debounced.cancel = () => {
        if (timer !== undefined) {
            clearTimeout(timer);
            timer = undefined;
        }
    };

    return debounced;
};
