export type CardProps<T, R> = T & {
    items: R[],
    total: number,
    isAdmin: boolean
}
