const pagingParser = (query: string) => {
    const params = new URL(query).searchParams;
    return {
        page: Number(params.get("page")) || 0,
        size: Number(params.get("size")) || 10,
        sort: params.get("sort") || "id",
        order: params.get("order") || "asc",
    }
}

export default pagingParser;
