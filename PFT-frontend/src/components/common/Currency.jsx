import React from "react";
import { useCurrency } from "../../hooks/currency";

export default function Currency({ value, onChange }) {
    const { getCurrencies } = useCurrency();
    const { data: currencies, isLoading, isError } = getCurrencies;

    return (
        <div className="flex flex-col gap-2">
            <label
                htmlFor="currency"
                className="text-sm font-semibold text-text/70"
            >
                Select Currency
            </label>
            <select
                id="currency"
                className="border border-border p-2 rounded-md focus:ring-2 focus:ring-emerald-400 outline-none"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                <option value="">{isLoading ? "Loading currencies" : "-- Choose a currency --"}</option>
                {currencies?.map((currency) => (
                    <option key={currency.id} value={currency.id}>
                        {currency.name} ({currency.code})
                    </option>
                ))}
            </select>
        </div>
    );
}
