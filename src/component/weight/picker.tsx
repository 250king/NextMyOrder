"use client";

import React from "react";
import { Calendar, DateField, DatePicker, FieldError, Label, TimeField } from "@heroui/react";
import type { DateValue } from "@internationalized/date";

type DateTimeGranularity = "hour" | "minute" | "second";
type TimeFieldValue = React.ComponentProps<typeof TimeField>["value"];

type DateTimePickerProps = Omit<
    React.ComponentProps<typeof DatePicker>,
    "children" | "defaultValue" | "granularity" | "onChange" | "value"
> & {
    calendarAriaLabel?: string;
    defaultValue?: DateValue | null;
    granularity?: DateTimeGranularity;
    groupVariant?: React.ComponentProps<typeof DateField.Group>["variant"];
    label: React.ReactNode;
    onChange?: (value: DateValue | null) => void;
    timeLabel?: React.ReactNode;
    value?: DateValue | null;
};

const hasTime = (value: DateValue | null): value is Extract<DateValue, { hour: number }> => {
    return value !== null && "hour" in value;
};

export const DateTimePicker = ({
    calendarAriaLabel = "选择日期",
    defaultValue = null,
    granularity = "minute",
    groupVariant = "secondary",
    hourCycle = 24,
    hideTimeZone = true,
    label,
    onChange,
    timeLabel = "时间",
    value,
    ...props
}: DateTimePickerProps) => {
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = React.useState<DateValue | null>(defaultValue);
    const currentValue = isControlled ? value : internalValue;

    const handleChange = React.useCallback(
        (nextValue: DateValue | null) => {
            if (!isControlled) {
                setInternalValue(nextValue);
            }

            onChange?.(nextValue);
        },
        [isControlled, onChange]
    );

    const handleTimeChange = React.useCallback(
        (nextTime: TimeFieldValue) => {
            if (!nextTime || !hasTime(currentValue)) {
                return;
            }

            handleChange(
                currentValue.set({
                    hour: nextTime.hour,
                    millisecond: nextTime.millisecond,
                    minute: nextTime.minute,
                    second: nextTime.second,
                })
            );
        },
        [currentValue, handleChange]
    );

    return (
        <DatePicker
            {...props}
            granularity={granularity}
            hideTimeZone={hideTimeZone}
            hourCycle={hourCycle}
            value={currentValue}
            onChange={handleChange}
        >
            <Label>{label}</Label>
            <DateField.Group variant={groupVariant}>
                <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
                <DateField.Suffix>
                    <DatePicker.Trigger>
                        <DatePicker.TriggerIndicator />
                    </DatePicker.Trigger>
                </DateField.Suffix>
            </DateField.Group>
            <FieldError />
            <DatePicker.Popover className="flex flex-col gap-3">
                <Calendar aria-label={calendarAriaLabel}>
                    <Calendar.Header>
                        <Calendar.YearPickerTrigger>
                            <Calendar.YearPickerTriggerHeading />
                            <Calendar.YearPickerTriggerIndicator />
                        </Calendar.YearPickerTrigger>
                        <Calendar.NavButton slot="previous" />
                        <Calendar.NavButton slot="next" />
                    </Calendar.Header>
                    <Calendar.Grid>
                        <Calendar.GridHeader>{(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}</Calendar.GridHeader>
                        <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
                    </Calendar.Grid>
                    <Calendar.YearPickerGrid>
                        <Calendar.YearPickerGridBody>
                            {({ year }) => <Calendar.YearPickerCell year={year} />}
                        </Calendar.YearPickerGridBody>
                    </Calendar.YearPickerGrid>
                </Calendar>
                <div className="flex items-center justify-between gap-4">
                    <Label>{timeLabel}</Label>
                    <TimeField
                        granularity={granularity}
                        hideTimeZone={hideTimeZone}
                        hourCycle={hourCycle}
                        value={hasTime(currentValue) ? currentValue : null}
                        onChange={handleTimeChange}
                    >
                        <TimeField.Group variant={groupVariant}>
                            <TimeField.Input>
                                {(segment) => <TimeField.Segment segment={segment} />}
                            </TimeField.Input>
                        </TimeField.Group>
                    </TimeField>
                </div>
            </DatePicker.Popover>
        </DatePicker>
    );
};
