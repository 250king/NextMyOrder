import {z} from "zod/v4";

const nullable = <T extends z.ZodTypeAny>(
    schema: T,
) => {
    return schema.optional().nullable().transform(val =>
        val === '' || val === undefined ? null : val,
    );
};

export default nullable;
