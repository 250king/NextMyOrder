import React from "react";

export type FiltersProps<T> = T & {
    startTransition: React.TransitionStartFunction;
};
