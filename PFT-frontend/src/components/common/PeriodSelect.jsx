export default function PeriodSelect({
    datePreset,
    dateFrom,
    dateTo,
    onPresetChange,
    onDateFromChange,
    onDateToChange,
}) {
    const isInvalidRange =
        datePreset === "custom" &&
        dateFrom &&
        dateTo &&
        new Date(dateTo) < new Date(dateFrom);

    return (
        <>
            {/* PERIOD SELECT */}
            <div>
                <label className="text-sm text-text block mb-1">Period</label>
                <select
                    value={datePreset}
                    onChange={(e) => onPresetChange(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-white"
                >
                    <option value="all">All time</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                    <option value="custom">Custom</option>
                </select>
            </div>

            {/* CUSTOM DATE RANGE */}
            {datePreset === "custom" && (
                <div className="flex gap-4 col-span-2">
                    <div className="w-full">
                        <label className="text-sm block mb-1">Date From</label>
                        <input
                            type="date"
                            value={dateFrom || ""}
                            onChange={(e) => onDateFromChange(e.target.value)}
                            className="w-full border border-border bg-white rounded-md px-3 py-2 text-sm"
                        />
                    </div>

                    <div className="w-full">
                        <label className="text-sm block mb-1">Date To {isInvalidRange && (<span className="text-xs text-red-500"> cannot be earlier than "date from".</span>)}</label>
                        <input
                            type="date"
                            value={dateTo || ""}
                            min={dateFrom || undefined}
                            onChange={(e) => onDateToChange(e.target.value)}
                            className={`w-full border rounded-md px-3 py-2 text-sm
                                ${isInvalidRange ? "border-red-500" : "border-border"}
                            `}
                        />
                    </div>
                </div>
            )}
        </>
    );
}
