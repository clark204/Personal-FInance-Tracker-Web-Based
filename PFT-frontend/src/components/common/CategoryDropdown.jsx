import { useState, useMemo, useRef, useEffect } from "react";
import { ChevronLeft, Tag, Plus, X } from "lucide-react";
import { useCategory } from "../../hooks/category";

export default function CategoryDropdown({ selectedId, onSelect, disabled = false, size = "medium" }) {
    const { getCategories, createCategory } = useCategory();
    const categories = getCategories?.data?.data || [];
    const modalRef = useRef(null);

    const [selectedMain, setSelectedMain] = useState("");
    const [selectedSub, setSelectedSub] = useState("");
    const [isCustom, setIsCustom] = useState(false);
    const [customName, setCustomName] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const sizeClasses = {
        small: "text-sm pl-9 pr-3 py-2",
        medium: "text-base pl-10 pr-4 py-3",
    };

    const iconSize = {
        small: "w-3.5 h-3.5",
        medium: "w-4 h-4",
    };

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
    const selectedCategory = categories.find(c => c.id == selectedId);

    const handleBack = () => {
        setSelectedMain("");
        setSelectedSub("");
    };

    const handleCreateCategory = async () => {
        if (!customName.trim()) return;
        
        setIsCreating(true);
        const newCategory = {
            category_name: customName.trim(),
            parent_id: selectedMain ? Number(selectedMain) : null,
        };

        try {
            await createCategory.mutateAsync(newCategory);
            setCustomName("");
            setIsCustom(false);
        } catch (error) {
            console.error("Failed to create category:", error);
        } finally {
            setIsCreating(false);
        }
    };

    // Reset custom mode when disabled
    useEffect(() => {
        if (disabled) {
            setIsCustom(false);
            setCustomName("");
        }
    }, [disabled]);

    // Handle ESC key
    useEffect(() => {
        if (!isCustom) return;
        
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                setIsCustom(false);
                setCustomName("");
            }
        };
        
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isCustom]);

    return (
        <div className="space-y-2">
            {/* Custom Toggle - Compact */}
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => {
                        if (disabled) return;
                        setIsCustom(!isCustom);
                        setSelectedMain("");
                        setSelectedSub("");
                        setCustomName("");
                    }}
                    disabled={disabled}
                    className={`flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-800 transition-colors duration-150
                             ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                    <div className={`w-4 h-4 border rounded flex items-center justify-center ${isCustom ? 'bg-icon border-icon' : 'border-gray-300'}`}>
                        {isCustom && <Plus className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <span>Create custom category</span>
                </button>
            </div>

            {/* Custom Category Form */}
            {isCustom && (
                <div ref={modalRef} className="space-y-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-gray-700">Custom category name</label>
                        <button
                            onClick={() => {
                                setIsCustom(false);
                                setCustomName("");
                            }}
                            disabled={isCreating}
                            className="p-1 hover:bg-gray-200 rounded transition-colors duration-150 disabled:opacity-50 cursor-pointer"
                        >
                            <X className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                    </div>
                    <input
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        disabled={isCreating}
                        placeholder="Enter category name"
                        className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 
                                 focus:border-focus focus:ring-1 focus:ring-focus/20 outline-none transition-colors duration-150
                                 ${isCreating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && customName.trim()) {
                                handleCreateCategory();
                            }
                        }}
                    />
                    <button
                        type="button"
                        onClick={handleCreateCategory}
                        disabled={!customName.trim() || isCreating}
                        className="w-full bg-button text-white text-sm font-medium py-2.5 rounded-lg 
                                 hover:bg-hover-button transition-colors duration-150 disabled:opacity-50 
                                 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                    >
                        {isCreating ? (
                            <>
                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>Save Category</span>
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Main Category Selection */}
            {!isCustom && (
                <div>
                    {!selectedMain && (
                        <div className="relative">
                            <Tag className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${iconSize[size]} text-gray-400`} />
                            <select
                                id="mainCategory"
                                name="mainCategory"
                                value={selectedMain}
                                onChange={(e) => {
                                    setSelectedMain(e.target.value);
                                    setSelectedSub("");
                                }}
                                disabled={disabled || mainCategories.length === 0}
                                className={`w-full border border-gray-300 rounded-lg bg-white text-gray-900 
                                         focus:border-focus focus:ring-1 focus:ring-focus/20 outline-none 
                                         transition-colors duration-150 ${sizeClasses[size]}
                                         ${disabled || mainCategories.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <option value="">
                                    {mainCategories.length === 0 ? "No categories available" : "Select category"}
                                </option>
                                {mainCategories.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.category_name}
                                    </option>
                                ))}
                            </select>
                            {selectedCategory && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    <div className={`w-2 h-2 rounded-full ${selectedCategory.type === 'Income' ? 'bg-income' : 'bg-expense'}`} />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Subcategory Tree View */}
                    {selectedMain && (
                        <div className="border border-gray-200 rounded-lg bg-white p-3 space-y-3">
                            {/* Back button */}
                            <button
                                onClick={handleBack}
                                disabled={disabled}
                                className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-800 
                                         transition-colors duration-150 disabled:opacity-50 cursor-pointer"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                <span>Back to categories</span>
                            </button>

                            {/* Main category header */}
                            <div className="flex items-center gap-2">
                                <Tag className="w-4 h-4 text-icon" />
                                <span className="font-medium text-gray-700">{activeMain?.category_name}</span>
                            </div>

                            {/* Subcategory options */}
                            <div className="space-y-1.5 pl-2">
                                {/* General option */}
                                <div
                                    onClick={() => {
                                        if (disabled) return;
                                        setSelectedSub(selectedMain);
                                        onSelect(selectedMain);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !disabled) {
                                            setSelectedSub(selectedMain);
                                            onSelect(selectedMain);
                                        }
                                    }}
                                    tabIndex={disabled ? -1 : 0}
                                    className={`p-2 rounded cursor-pointer transition-colors duration-150 flex items-center gap-2
                                             ${selectedSub == selectedMain 
                                                ? 'bg-icon/10 text-icon border border-icon/20' 
                                                : 'hover:bg-gray-100 text-gray-700'
                                             } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                                    <span className="text-sm">General</span>
                                </div>

                                {/* Subcategories */}
                                {subCategories.map((s) => (
                                    <div
                                        key={s.id}
                                        onClick={() => {
                                            if (disabled) return;
                                            setSelectedSub(s.id);
                                            onSelect(s.id);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !disabled) {
                                                setSelectedSub(s.id);
                                                onSelect(s.id);
                                            }
                                        }}
                                        tabIndex={disabled ? -1 : 0}
                                        className={`p-2 rounded cursor-pointer transition-colors duration-150 flex items-center gap-2
                                                 ${selectedSub == s.id 
                                                    ? 'bg-icon/10 text-icon border border-icon/20' 
                                                    : 'hover:bg-gray-100 text-gray-700'
                                                 } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                                        <span className="text-sm">{s.category_name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}