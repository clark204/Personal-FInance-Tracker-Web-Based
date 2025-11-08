import { useState, useMemo, useEffect } from "react";
import { useCategory } from "../../hooks/category";

function Category({ onSelect, selectedId }) {
    const { getCategories } = useCategory();
    const { data: categories = [], isLoading } = getCategories;

    const [selectedParent, setSelectedParent] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState("");

    // Extract main categories (top-level)
    const mainCategories = useMemo(
        () => categories.filter((cat) => cat.parent_id === null),
        [categories]
    );

    // Extract subcategories for selected parent
    const subcategories = useMemo(
        () =>
            selectedParent
                ? categories.filter(
                    (cat) => Number(cat.parent_id) === Number(selectedParent)
                )
                : [],
        [categories, selectedParent]
    );

    // Auto-select parent or subcategory when editing
    useEffect(() => {
        if (selectedId && categories.length) {
            const selectedCat = categories.find(
                (c) => c.category_id === Number(selectedId)
            );
            if (selectedCat) {
                const parentId = selectedCat.parent_id || selectedCat.category_id;
                setSelectedParent(parentId);
                setSelectedCategory(selectedCat.category_id);
                if (onSelect) onSelect(selectedCat.category_id);
            }
        }
    }, [selectedId, categories, onSelect]);

    // Handle selecting a main category
    const handleParentSelect = (e) => {
        const parentId = Number(e.target.value);
        setSelectedParent(parentId);
        setSelectedCategory(parentId); // treat as general category selection
        if (onSelect) onSelect(parentId);
    };

    // Handle selecting a subcategory
    const handleCategorySelect = (e) => {
        const categoryId = Number(e.target.value);
        setSelectedCategory(categoryId);
        if (onSelect) onSelect(categoryId);
    };

    if (isLoading)
        return <p className="text-text-secondary">Loading categories...</p>;

    return (
        <div className="space-y-4 bg-surface p-4 rounded-2xl border border-border shadow-sm">
            {!selectedParent ? (
                // STEP 1: Show main categories
                <div>
                    <label className="block text-sm font-medium text-text mb-1">
                        Select Category
                    </label>
                    <select
                        value={selectedParent || ""}
                        onChange={handleParentSelect}
                        className="w-full p-2 rounded-lg border border-border text-text focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    >
                        <option value="">Select Category</option>
                        {mainCategories.map((cat) => (
                            <option key={cat.category_id} value={cat.category_id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>
            ) : (
                // STEP 2: Show main + subcategories for that parent
                <div>
                    <label className="block text-sm font-medium text-text mb-1">
                        Select Specific Category
                    </label>
                    <select
                        value={selectedCategory || ""}
                        onChange={handleCategorySelect}
                        className="w-full p-2 rounded-lg border border-border text-text focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    >
                        <option value="">Select...</option>

                        {/* Main category option */}
                        {mainCategories
                            .filter((cat) => cat.category_id === Number(selectedParent))
                            .map((cat) => (
                                <option key={cat.category_id} value={cat.category_id}>
                                    {cat.name} (General)
                                </option>
                            ))}

                        {/* Subcategories */}
                        {subcategories.map((sub) => (
                            <option key={sub.category_id} value={sub.category_id}>
                                └ {sub.name}
                            </option>
                        ))}
                    </select>

                    <button
                        type="button"
                        onClick={() => {
                            setSelectedParent(null);
                            setSelectedCategory("");
                            if (onSelect) onSelect("");
                        }}
                        className="text-sm text-text mt-2 hover:underline transition-colors"
                    >
                        ← Choose another main category
                    </button>
                </div>
            )}
        </div>
    );
}

export default Category;
