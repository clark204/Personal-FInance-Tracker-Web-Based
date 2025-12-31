import { useState, useMemo } from "react";
import { ChevronLeft, X } from "lucide-react";
import { useCategory } from "../../hooks/category";

export default function CategoryFilter({ selectedCategory, onSelect }) {
    const { getCategories } = useCategory();
    const categories = getCategories?.data?.data || [];

    const [selectedMain, setSelectedMain] = useState("");
    const [showSubcategories, setShowSubcategories] = useState(false);

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

    const handleMainCategorySelect = (e) => {
        const value = e.target.value;
        setSelectedMain(value);
        onSelect(value || "");
        // Only show subcategories if there are any
        if (value && categories.filter(c => c.parent_id === Number(value)).length > 0) {
            setShowSubcategories(true);
        }
    };

    const handleBack = () => {
        setShowSubcategories(false);
        // Don't clear selectedMain or onSelect to keep the selection
    };

    const handleClose = () => {
        setShowSubcategories(false);
        // Don't clear selectedMain or onSelect to keep the selection
    };

    const handleSubcategorySelect = (categoryId) => {
        onSelect(categoryId);
        setShowSubcategories(false);
    };

    // Find the selected category name for display
    const selectedCategoryName = useMemo(() => {
        if (!selectedCategory) return "";
        if (selectedCategory == selectedMain) return activeMain?.category_name;
        return categories.find(c => c.id == selectedCategory)?.category_name || "";
    }, [selectedCategory, selectedMain, categories, activeMain]);

    return (
        <div className="flex flex-col relative">
            {/* MAIN CATEGORY SELECT - ALWAYS VISIBLE */}
            <div className="relative">
                <select
                    className="border border-border p-2 rounded-lg w-full focus:ring-2 focus:ring-focus outline-none"
                    value={selectedMain}
                    onChange={handleMainCategorySelect}
                >
                    <option value="">All category</option>
                    {mainCategories.map((m) => (
                        <option key={m.id} value={m.id}>
                            {m.category_name}
                        </option>
                    ))}
                </select>
                
                {/* Display selected category */}
                {selectedCategory && (
                    <div className="absolute inset-0 bg-white border border-border rounded-lg px-3 py-2 text-sm flex items-center justify-between">
                        <span className="text-gray-700 truncate">
                            {selectedCategoryName}
                        </span>
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedMain("");
                                onSelect("");
                            }}
                            className="text-gray-400 hover:text-gray-600"
                            aria-label="Clear selection"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}
            </div>

            {/* SUBCATEGORY OVERLAY - APPEARS ABOVE THE SELECT */}
            {selectedMain && showSubcategories && (
                <div className="absolute top-0 left-0 right-0 z-10 border border-border rounded-lg bg-white shadow-lg">
                    <div className="flex flex-col p-4 max-h-80 overflow-y-auto">
                        {/* HEADER WITH BACK AND CLOSE BUTTONS */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-text transition-colors p-1 rounded hover:bg-gray-100"
                                    onClick={handleBack}
                                    aria-label="Go back to main categories"
                                >
                                    <ChevronLeft size={18} />
                                    Back
                                </button>
                                <span className="text-text font-semibold text-base">
                                    {activeMain?.category_name}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={handleClose}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
                                aria-label="Close subcategories"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* GENERAL OPTION */}
                        <div
                            className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 mb-1 ${selectedCategory == selectedMain
                                ? "bg-blue-50 border border-blue-200"
                                : ""
                                }`}
                            onClick={() => handleSubcategorySelect(selectedMain)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubcategorySelect(selectedMain)}
                        >
                            <div className={`w-2 h-2 rounded-full ${selectedCategory == selectedMain ? "bg-blue-600" : "bg-gray-400"}`} />
                            <span className={`${selectedCategory == selectedMain ? "font-semibold text-blue-600" : "text-gray-700"}`}>
                                All {activeMain?.category_name} (General)
                            </span>
                            {selectedCategory == selectedMain && (
                                <span className="ml-auto text-xs text-blue-600 font-medium">✓</span>
                            )}
                        </div>

                        {/* SUBCATEGORIES LIST */}
                        <div className="flex flex-col gap-1">
                            {subCategories.length > 0 ? (
                                subCategories.map((s) => (
                                    <div
                                        key={s.id}
                                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${selectedCategory == s.id
                                            ? "bg-blue-50 border border-blue-200"
                                            : ""
                                            }`}
                                        onClick={() => handleSubcategorySelect(s.id)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSubcategorySelect(s.id)}
                                    >
                                        <div className={`w-2 h-2 rounded-full ${selectedCategory == s.id ? "bg-blue-600" : "bg-gray-400"}`} />
                                        <span className={`${selectedCategory == s.id ? "font-semibold text-blue-600" : "text-gray-700"}`}>
                                            {s.category_name}
                                        </span>
                                        {selectedCategory == s.id && (
                                            <span className="ml-auto text-xs text-blue-600 font-medium">✓</span>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-2 text-gray-500 text-sm">
                                    No subcategories available
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}