import React, { useState } from 'react';
import {
  X,
  UploadCloud,
  Trash2,
  Loader2,
  CheckCircle,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES, CAMPUS_LOCATIONS } from '../lib/mockData';
import type { ListingCondition, Listing } from '../types';
import { uploadListingImage } from '../lib/r2';
import { createListing } from '../lib/supabase';
import { formatKenyanWhatsAppNumber } from '../lib/whatsapp';

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onListingCreated: (newListing: Listing) => void;
  onRequireAuth: () => void;
}

export const CreateListingModal: React.FC<CreateListingModalProps> = ({
  isOpen,
  onClose,
  onListingCreated,
  onRequireAuth,
}) => {
  const { user, profile } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [isNegotiable, setIsNegotiable] = useState(true);
  const [categoryId, setCategoryId] = useState('electronics');
  const [condition, setCondition] = useState<ListingCondition>('Like New');
  const [locationArea, setLocationArea] = useState('batian');
  const [locationDetails, setLocationDetails] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState(profile?.whatsapp_number || '');

  // Images
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  // If user is not logged in, prompt seller login
  if (!user) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="relative bg-white w-full max-w-md rounded-3xl p-6 text-center shadow-2xl border border-slate-100">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-700 mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-emerald-600" />
          </div>

          <h3 className="text-xl font-extrabold text-slate-900 mb-2">
            Seller Account Required
          </h3>
          <p className="text-sm text-slate-600 mb-6">
            Buyers can browse without an account, but sellers need a quick profile so students can connect with you on WhatsApp and verify your campus location.
          </p>

          <button
            onClick={() => {
              onClose();
              onRequireAuth();
            }}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer text-sm"
          >
            Create Seller Account / Sign In
          </button>
        </div>
      </div>
    );
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    if (imageFiles.length + files.length > 5) {
      setErrorMsg('You can upload a maximum of 5 photos per listing.');
      return;
    }

    const updatedFiles = [...imageFiles, ...files];
    setImageFiles(updatedFiles);

    // Generate local previews
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setPreviewUrls((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    const updatedFiles = imageFiles.filter((_, i) => i !== index);
    const updatedPreviews = previewUrls.filter((_, i) => i !== index);
    setImageFiles(updatedFiles);
    setPreviewUrls(updatedPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Please enter a descriptive item title.');
      return;
    }
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      setErrorMsg('Please enter a valid price in KES.');
      return;
    }
    const cleanPhone = formatKenyanWhatsAppNumber(whatsappNumber || profile?.whatsapp_number || '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid Kenyan WhatsApp number (e.g. 0712345678).');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress('Preparing photos...');

    try {
      const uploadedImageUrls: string[] = [];

      // Upload each image to Cloudflare R2
      if (imageFiles.length > 0) {
        for (let i = 0; i < imageFiles.length; i++) {
          setUploadProgress(`Uploading photo ${i + 1} of ${imageFiles.length} to Cloudflare R2...`);
          const url = await uploadListingImage(imageFiles[i]);
          uploadedImageUrls.push(url);
        }
      } else {
        // Fallback placeholder image by category
        uploadedImageUrls.push('https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80');
      }

      setUploadProgress('Publishing listing to DeKUT Soko...');

      const selectedLoc = CAMPUS_LOCATIONS.find((l) => l.id === locationArea)?.name || 'DeKUT Campus';
      const fullLocationString = locationDetails.trim()
        ? `${selectedLoc} (${locationDetails.trim()})`
        : selectedLoc;

      const created = await createListing({
        seller_id: user.id,
        title: title.trim(),
        description: description.trim() || 'No additional description provided.',
        price: numPrice,
        is_negotiable: isNegotiable,
        category_id: categoryId,
        condition,
        location: fullLocationString,
        images: uploadedImageUrls,
        status: 'active',
        seller_name: profile?.full_name || 'DeKUT Comrade',
        seller_whatsapp: cleanPhone,
        seller_phone: cleanPhone,
        seller_avatar: profile?.avatar_url,
        seller_verified: profile?.is_verified ?? true,
        seller_hostel: selectedLoc,
      });

      // Confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Safe fallback
      }

      setSuccess(true);
      setTimeout(() => {
        onListingCreated(created);
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Failed to create listing:', err);
      setErrorMsg('Failed to publish listing. Please try again.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
              <span>List Item for Sale</span>
              <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                DeKUT Soko
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Photos stored in Cloudflare R2 • Buyers will contact you directly on WhatsApp
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content / Form */}
        <form onSubmit={handleSubmit} className="p-6 max-h-[80vh] overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm font-bold flex items-center space-x-2 text-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span>Listing Published Successfully! Comrades can now find your item.</span>
            </div>
          )}

          {/* Photo Upload Zone (Cloudflare R2) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Product Photos (Up to 5 images)
            </label>
            <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-4 text-center transition-colors bg-slate-50/50">
              <input
                type="file"
                id="listing-photos"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                disabled={isSubmitting || previewUrls.length >= 5}
                className="hidden"
              />
              <label
                htmlFor="listing-photos"
                className="cursor-pointer flex flex-col items-center justify-center space-y-1.5"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-slate-800">
                  Click to upload item photos
                </div>
                <p className="text-[11px] text-slate-400">
                  PNG, JPG, WebP • Auto-optimized for Cloudflare R2
                </p>
              </label>

              {/* Previews */}
              {previewUrls.length > 0 && (
                <div className="grid grid-cols-5 gap-2 mt-3 pt-3 border-t border-slate-200">
                  {previewUrls.map((url, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden group border border-slate-200">
                      <img src={url} alt="preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute inset-0 bg-rose-600/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Item Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Item Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Casio fx-991EX Calculator / RGB Strip Lights 10M / 6kg Gas Cylinder"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Category & Condition Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden cursor-pointer"
              >
                {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Item Condition *
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as ListingCondition)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden cursor-pointer"
              >
                <option value="Brand New">Brand New (Unopened/Never used)</option>
                <option value="Like New">Like New (Used briefly, immaculate)</option>
                <option value="Gently Used">Gently Used (Minor normal wear)</option>
                <option value="Fair">Fair (Working condition, noticeable wear)</option>
              </select>
            </div>
          </div>

          {/* Price & Negotiable toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Price (KES) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                  KES
                </span>
                <input
                  type="number"
                  placeholder="2500"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  min="0"
                  className="w-full pl-12 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="pt-5 sm:pt-4">
              <label className="flex items-center space-x-2.5 cursor-pointer bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  checked={isNegotiable}
                  onChange={(e) => setIsNegotiable(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800">
                  Price is Negotiable (Comrades can bargain)
                </span>
              </label>
            </div>
          </div>

          {/* Location Area & Landmark */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Campus Location / Hostel *
              </label>
              <select
                value={locationArea}
                onChange={(e) => setLocationArea(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden cursor-pointer"
              >
                {CAMPUS_LOCATIONS.filter((l) => l.id !== 'all').map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Specific Spot / Room (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 2nd Floor Rm 14 / Corner House Nyaribo"
                value={locationDetails}
                onChange={(e) => setLocationDetails(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* WhatsApp Phone for Buyers */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Your WhatsApp Number (Where buyers will text you) *
            </label>
            <input
              type="text"
              placeholder="0712345678 or 0112345678"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Buyers will click "WhatsApp" on your listing to message you directly with zero delay.
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Description / Notes
            </label>
            <textarea
              rows={3}
              placeholder="Why are you selling? Any accessories included? Mention how long it was used or any unique details."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 text-sm flex items-center space-x-2 transition-all cursor-pointer disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{uploadProgress || 'Publishing...'}</span>
                </>
              ) : (
                <span>Post Item for Sale</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
