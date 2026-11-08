import React, { useState, useEffect } from 'react';
import { X, Utensils, Check, Image as ImageIcon } from 'lucide-react';
import { MenuItem, MenuCategory } from '../types';
import { restaurantImageUrl } from '../utils/restaurantImage';

interface MenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<MenuItem>) => Promise<void>;
  initialItem?: MenuItem | null;
}

const CATEGORIES: MenuCategory[] = ['Burgers', 'Pasta', 'Chicken', 'Wraps', 'Sides', 'Drinks', 'Desserts'];
const AVAILABLE_TAGS = ['Popular', "Chef's Special", 'Vegetarian', 'Gluten-Free', 'Spicy'];

const PRESET_IMAGES = [
  { label: 'Smash Burger', url: '/src/assets/images/smash_beef_burger_1794144185428.jpg' },
  { label: 'Classic Burger', url: '/src/assets/images/food_classic_burger_1793943077745.jpg' },
  { label: 'Truffle Pasta', url: '/src/assets/images/food_signature_truffle_pasta_1793941744497.jpg' },
  { label: 'Peri-Peri Chicken', url: '/src/assets/images/peri_peri_chicken_1794144200612.jpg' },
  { label: 'Beef Shawarma', url: '/src/assets/images/beef_shawarma_wrap_1794144201442.jpg' },
  { label: 'Truffle Fries', url: '/src/assets/images/truffle_fries_1794144234391.jpg' },
  { label: 'Berry Mojito', url: '/src/assets/images/berry_bliss_mojito_1794144215709.jpg' },
  { label: 'Lava Cake', url: '/src/assets/images/chocolate_lava_cake_1794144216052.jpg' },
];

export const MenuItemModal: React.FC<MenuItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialItem,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<MenuCategory>('Mains');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('24');
  const [isAvailable, setIsAvailable] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [image, setImage] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialItem) {
      setName(initialItem.name);
      setCategory(initialItem.category);
      setDescription(initialItem.description);
      setPrice(String(initialItem.price));
      setIsAvailable(initialItem.isAvailable);
      setSelectedTags(initialItem.dietaryTags || []);
      setImage(initialItem.image || '');
    } else {
      setName('');
      setCategory('Mains');
      setDescription('');
      setPrice('24');
      setIsAvailable(true);
      setSelectedTags([]);
      setImage('');
    }
    setErrorMsg('');
  }, [initialItem, isOpen]);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Item name is required.');
      return;
    }
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      setErrorMsg('Please enter a valid price.');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        category,
        description: description.trim(),
        price: numPrice,
        isAvailable,
        dietaryTags: selectedTags,
        image: image.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save menu item.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden text-stone-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-white">
                {initialItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h3>
              <p className="text-xs text-stone-400">
                Changes will immediately reflect on the public website.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-stone-300">
                Item Name <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Handmade Truffle Gnocchi"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-stone-950 border border-stone-800 text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-stone-300">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MenuCategory)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price & Availability */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-stone-300">
                Price (Rs.) <span className="text-amber-400">*</span>
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono transition-all"
              />
            </div>

            <div className="space-y-1.5 pt-4 sm:pt-0">
              <label className="block text-xs font-semibold text-stone-300">Kitchen Availability</label>
              <button
                type="button"
                onClick={() => setIsAvailable(!isAvailable)}
                className={`w-full py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-colors ${
                  isAvailable
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                }`}
              >
                <span>{isAvailable ? 'In Stock (Available)' : 'Sold Out (Unavailable)'}</span>
                <span
                  className={`w-3.5 h-3.5 rounded-full ${
                    isAvailable ? 'bg-emerald-400' : 'bg-rose-400'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-stone-300">Description & Ingredients</label>
            <textarea
              rows={2}
              placeholder="Detailed culinary description, provenance, and flavor notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-stone-950 border border-stone-800 text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none transition-all"
            />
          </div>

          {/* Dietary Tags */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-stone-300">Dietary & Menu Tags</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 border ${
                      isSelected
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-stone-950 text-stone-400 border-stone-800 hover:text-stone-200'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-amber-400" />}
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Image URL & Presets */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-stone-300">Dish Photography (Optional)</label>
            <div className="relative">
              <ImageIcon className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Image path or external URL..."
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-stone-950 border border-stone-800 text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono"
              />
            </div>

            {/* Quick Presets */}
            <div className="pt-1 flex flex-wrap gap-1.5 items-center text-[11px] text-stone-400">
              <span>Choose preset:</span>
              {PRESET_IMAGES.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setImage(restaurantImageUrl(preset.url))}
                  className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 text-[10px]"
                >
                  {preset.label}
                </button>
              ))}
              {image && (
                <button
                  type="button"
                  onClick={() => setImage('')}
                  className="text-stone-500 hover:text-stone-300 underline text-[10px]"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-stone-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 hover:text-white text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors shadow-md disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{initialItem ? 'Update Menu Item' : 'Add to Menu'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
