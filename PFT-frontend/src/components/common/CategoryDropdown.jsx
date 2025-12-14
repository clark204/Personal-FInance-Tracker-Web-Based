import { useState, useMemo } from "react";
import { ChevronLeft } from "lucide-react";
import { useCategory } from "../../hooks/category";

export default function CategoryDropdown({ selectedId, onSelect }) {
    const { getCategories, createCategory } = useCategory();
    const categories = getCategories?.data?.data || [];

    const [selectedMain, setSelectedMain] = useState("");
    const [selectedSub, setSelectedSub] = useState("");
    const [isCustom, setIsCustom] = useState(false);
    const [customName, setCustomName] = useState("");

    const mainCategories = useMemo(() => {
        return Array.isArray(categories)
            ? categories.filter(c => c.parent_id === null)
            : [];
    }, [categories]);

    const subCategories = useMemo(() => {
        if (!selectedMain) return [];
        return categories.filter(c => c.parent_id === Number(selectedMain));
    }, [categories, selectedMain]);

    const activeMain = mainCategories.find(m => m.id == selectedMain);

    const handleBack = () => {
        setSelectedMain("");
        setSelectedSub("");
    };

    const handleCreateCategory = () => {
        if (!customName.trim()) return;

        const newCategory = {
            category_name: customName,
            parent_id: selectedMain ? Number(selectedMain) : null,
        };

        createCategory.mutate(newCategory, {
            onSuccess: () => {
                setCustomName("");
                setIsCustom(false);
            }
        });
    };

    return (
        <div className="flex flex-col gap-2">

            {/* CUSTOM TOGGLE */}
            <label htmlFor="customToggle" className="flex items-center gap-1 text-sm">
                <input
                    id="customToggle"
                    name="customToggle"
                    type="checkbox"
                    checked={isCustom}
                    onChange={() => {
                        setIsCustom(!isCustom);
                        setSelectedMain("");
                        setSelectedSub("");
                        setCustomName("");
                    }}
                />
                Create custom category
            </label>

            {/* CUSTOM FORM */}
            {isCustom && (
                <div className="flex flex-col gap-1">
                    <label htmlFor="customName">Custom category name</label>
                    <input
                        id="customName"
                        name="customName"
                        className="border border-border focus:ring-2 focus:ring-focus outline-none py-2 px-3 rounded"
                        placeholder="Enter category name"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                    />
                    <button
                        type="button"
                        className="bg-button hover:bg-hover-button text-white p-2 rounded border border-border"
                        onClick={handleCreateCategory}
                    >
                        Save Custom Category
                    </button>
                </div>
            )}

            {/* MAIN CATEGORY MODE */}
            {!isCustom && (
                <div>
                    {!selectedMain && (
                        <>
                            <select
                                id="mainCategory"
                                name="mainCategory"
                                className="border border-border p-2 rounded w-full  focus:ring-2 focus:ring-focus outline-none"
                                value={selectedMain}
                                onChange={(e) => {
                                    setSelectedMain(e.target.value);
                                    setSelectedSub("");
                                }}
                            >
                                <option value="">Select category</option>

                                {mainCategories.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.category_name}
                                    </option>
                                ))}
                            </select>
                        </>
                    )}

                    {/* TREE VIEW */}
                    {selectedMain && (
                        <div
                            className="flex flex-col gap-2 border p-3 rounded bg-gray-50 max-h-44 overflow-auto"
                            role="list"
                            aria-label="Subcategory list"
                        >
                            <button
                                className="flex items-center gap-1 text-sm text-gray-600 hover:text-text w-fit"
                                onClick={handleBack}
                                aria-label="Go back to category list"
                            >
                                <ChevronLeft size={16} />
                                Back
                            </button>

                            <div className="font-semibold">{activeMain?.category_name}</div>

                            {/* General option */}
                            <div
                                key={`general-${selectedMain}`}
                                role="listitem"
                                tabIndex={0}
                                className={`cursor-pointer pl-4 ${selectedSub == selectedMain ? "font-bold" : ""
                                    }`}
                                onClick={() => {
                                    setSelectedSub(selectedMain);
                                    onSelect(selectedMain);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        setSelectedSub(selectedMain);
                                        onSelect(selectedMain);
                                    }
                                }}
                            >
                                • General
                            </div>

                            {/* Subcategories */}
                            {subCategories.map((s) => (
                                <div
                                    key={`subcat-${s.id}`}
                                    role="listitem"
                                    tabIndex={0}
                                    className={`cursor-pointer pl-4 ${selectedSub == s.id ? "font-bold" : ""
                                        }`}
                                    onClick={() => {
                                        setSelectedSub(s.id);
                                        onSelect(s.id);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            setSelectedSub(s.id);
                                            onSelect(s.id);
                                        }
                                    }}
                                >
                                    • {s.category_name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
