"use client";

import React, { useState, useRef, useEffect } from "react";
import { UploadCloud, Camera, Flame, Activity, AlertTriangle, RefreshCcw, ImageOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getApiBaseUrl } from "@/lib/api-base-url";
import { parseResponseJson } from "@/lib/parse-json-response";
import { parseAnalyzeResponse, isNoFoodResponse, type AnalyzeResponse } from "@/model/analyze-response";
import { NUTRITION_APP } from "@/constants/nutrition-app";
import { MAX_IMAGE_BYTES } from "@/constants/limits";

type AppState = "IDLE" | "ANALYZING" | "SUCCESS" | "NO_FOOD" | "ERROR";

export default function NutritionApp() {
  const [status, setStatus] = useState<AppState>("IDLE");
  const [clientNotice, setClientNotice] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [results, setResults] = useState<AnalyzeResponse | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sheetHeight, setSheetHeight] = useState(500);
  const sheetRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (sheetRef.current) {
      setSheetHeight(sheetRef.current.offsetHeight);
    }
  }, [results, status]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const processFile = async (file: File) => {
    setClientNotice(null);
    if (!file.type.startsWith("image/")) {
      setClientNotice(NUTRITION_APP.validation.notAnImage);
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setClientNotice(NUTRITION_APP.validation.fileTooLarge);
      return;
    }

    const base = getApiBaseUrl();
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    if (!base) {
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console -- surfacing config mistakes in dev
        console.error("NEXT_PUBLIC_API_URL is not set or empty");
      }
      setResults({ ok: false });
      setStatus("ERROR");
      return;
    }

    setStatus("ANALYZING");
    setIsCollapsed(false);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${base}/api/v1/predict`, {
        method: "POST",
        body: formData,
      });

      const raw = await parseResponseJson(response);
      if (raw === null) {
        setResults({ ok: false });
        setStatus("ERROR");
        return;
      }

      const parsed = parseAnalyzeResponse(raw);
      if (!parsed.success) {
        setResults({ ok: false });
        setStatus("ERROR");
        return;
      }

      const data = parsed.data;
      setResults(data);

      if (data.ok && data.prediction) {
        setStatus("SUCCESS");
      } else if (isNoFoodResponse(data)) {
        setStatus("NO_FOOD");
      } else {
        setStatus("ERROR");
      }
    } catch {
      setResults({ ok: false });
      setStatus("ERROR");
    }
  };

  const resetApp = () => {
    setStatus("IDLE");
    setClientNotice(null);
    setImagePreview(null);
    setResults(null);
    setIsCollapsed(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div 
      className="relative flex flex-col w-full h-[100dvh] bg-gradient-to-b from-[#b5d5e2] to-[#7198ad] text-[#13202e] overflow-hidden font-sans"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {clientNotice && (
        <div className="absolute top-0 left-0 right-0 z-[60] flex justify-center px-4 pt-20 pointer-events-none">
          <div
            role="status"
            className="w-full max-w-md pointer-events-auto px-4 py-3 rounded-xl border-4 border-[#13202e] bg-[#f2ead6] text-sm font-bold text-[#13202e] text-center shadow-[4px_4px_0px_#13202e]"
          >
            {clientNotice}
          </div>
        </div>
      )}
      {/* Navbar Section */}
      <div className="absolute top-0 left-0 right-0 z-50 p-6 flex justify-between items-start pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/logo.png" 
            alt={NUTRITION_APP.alt.logo} 
            className="w-14 h-14 rounded-full border-4 border-[#13202e] shadow-[4px_4px_0px_#13202e] bg-[#f2ead6] object-cover" 
          />
          <span className="font-black uppercase tracking-tight text-[#13202e] text-lg bg-[#f2ead6] px-4 py-1.5 rounded-xl border-4 border-[#13202e] shadow-[4px_4px_0px_#13202e] mt-2">
            {NUTRITION_APP.brand.name}
          </span>
        </div>
      </div>
      {/* Background Image Layer */}
      <AnimatePresence>
        {imagePreview && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={imagePreview} 
              alt={NUTRITION_APP.alt.foodPreview}   
              className="w-full h-full object-cover grayscale-[20%] contrast-125"
            />
            {/* Gradient overlay so text on top is readable */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#13202e]/60 via-[#13202e]/30 to-[#13202e]/80" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* IDLE STATE: Dropzone */}
      <AnimatePresence>
        {status === "IDLE" && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="absolute z-10 inset-0 flex flex-col items-center justify-center p-6"
          >
            <div 
              role="button"
              tabIndex={0}
              aria-label={NUTRITION_APP.idle.title}
              className="w-full max-w-sm rounded-[32px] border-4 border-[#13202e] bg-[#f2ead6] p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#e8dec7] transition-colors shadow-[8px_8px_0px_#13202e]"
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
            >
              <div className="w-20 h-20 rounded-full bg-[#13202e] text-[#f2ead6] flex items-center justify-center mb-6 shadow-inner">
                <Camera size={36} />
              </div>
              <h2 className="text-3xl font-black uppercase tracking-tight mb-2 text-[#13202e]">
                {NUTRITION_APP.idle.title}
              </h2>
              <p className="text-[#3c556b] font-medium text-sm mb-8 px-2">{NUTRITION_APP.idle.subtitle}</p>
              
              <button className="flex items-center justify-center gap-2 w-full bg-[#de4b28] text-white px-8 py-4 rounded-xl font-black uppercase tracking-wider text-sm border-2 border-[#13202e] hover:bg-[#c43f20] transition-colors shadow-[4px_4px_0px_#13202e] active:shadow-none active:translate-y-1 active:translate-x-1">
                <UploadCloud size={20} strokeWidth={3} />
                {NUTRITION_APP.idle.selectPhoto}
              </button>
            </div>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileSelect}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ANALYZING STATE: Loading/Scanning Pulse */}
      <AnimatePresence>
        {status === "ANALYZING" && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute z-10 inset-0 flex flex-col items-center justify-center p-6"
          >
            {/* Scanning line animation */}
            <motion.div 
              className="absolute top-0 left-0 right-0 h-2 bg-[#de4b28] shadow-[0_0_25px_8px_rgba(222,75,40,0.8)] z-20"
              animate={{ y: ["0vh", "100vh", "0vh"] }}
              transition={{ duration: 2.5, ease: "linear", repeat: Infinity }}
            />
            
            <div className="mt-auto mb-[20vh] bg-[#f2ead6] border-4 border-[#13202e] px-8 py-4 rounded-2xl flex items-center gap-4 shadow-[6px_6px_0px_#13202e]">
              <div className="w-6 h-6 border-4 border-[#de4b28] border-t-transparent rounded-full animate-spin" />
              <span className="font-black uppercase tracking-wider text-[#13202e]">
                {NUTRITION_APP.analyzing.label}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SUCCESS OR ERROR STATE: Bottom Sheet */}
      <AnimatePresence>
        {(status === "SUCCESS" || status === "NO_FOOD" || status === "ERROR") && results && (
          <motion.div 
            ref={sheetRef}
            initial={{ y: "100%" }}
            animate={{ y: isCollapsed ? Math.max(0, sheetHeight - 96) : 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: Math.max(0, sheetHeight - 96) }}
            dragElastic={{ top: 0, bottom: 0.2 }}
            dragMomentum={false}
            onDragEnd={(e, info) => {
              // Only consider significant movement to trigger state change
              const threshold = 50;
              const isFast = Math.abs(info.velocity.y) > 400;
              
              if (info.offset.y > threshold || (isFast && info.velocity.y > 0)) {
                setIsCollapsed(true);
              } else if (info.offset.y < -threshold || (isFast && info.velocity.y < 0)) {
                setIsCollapsed(false);
              }
            }}
            className="absolute z-30 bottom-0 left-0 right-0 mx-auto w-full max-w-md bg-[#f2ead6] rounded-t-[40px] border-t-8 border-l-8 border-r-8 border-[#13202e] shadow-[0_-10px_30px_rgba(0,0,0,0.5)] p-8 max-h-[85vh] touch-none"
          >
            <motion.div 
              className="w-16 h-2 bg-[#13202e] rounded-full mx-auto mb-8 opacity-50 cursor-pointer active:scale-110 transition-transform hover:opacity-100" 
              onTap={() => setIsCollapsed(!isCollapsed)}
            />
            
            {status === "SUCCESS" && results.prediction && (
              <div className="flex flex-col h-full space-y-6">
                <div className="flex justify-between items-end border-b-4 border-[#13202e] pb-4">
                  <div>
                    <h3 className="text-6xl font-black text-[#13202e] tracking-tighter">{results.prediction.calories}</h3>
                    <p className="text-sm font-bold uppercase tracking-widest text-[#de4b28] mt-2 flex items-center gap-1.5">
                      <Flame size={18} strokeWidth={3} /> {NUTRITION_APP.success.totalKcal}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center border-4 border-[#13202e] shadow-[4px_4px_0px_#13202e]">
                    <span className="text-[#13202e] font-black text-2xl sm:text-3xl">{results.prediction.protein}g</span>
                    <span className="text-[10px] sm:text-xs text-[#61859b] mt-1 uppercase tracking-black font-black">
                      {NUTRITION_APP.success.protein}
                    </span>
                  </div>
                  <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center border-4 border-[#13202e] shadow-[4px_4px_0px_#13202e]">
                    <span className="text-[#13202e] font-black text-2xl sm:text-3xl">{results.prediction.carbs}g</span>
                    <span className="text-[10px] sm:text-xs text-[#61859b] mt-1 uppercase tracking-black font-black">
                      {NUTRITION_APP.success.carbs}
                    </span>
                  </div>
                  <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center border-4 border-[#13202e] shadow-[4px_4px_0px_#13202e]">
                    <span className="text-[#13202e] font-black text-2xl sm:text-3xl">{results.prediction.fat}g</span>
                    <span className="text-[10px] sm:text-xs text-[#61859b] mt-1 uppercase tracking-black font-black">
                      {NUTRITION_APP.success.fat}
                    </span>
                  </div>
                </div>

                <div className="bg-[#b5d5e2] border-4 border-[#13202e] rounded-xl p-4 flex items-start gap-3 mt-4 shadow-[4px_4px_0px_#13202e]">
                  <Activity size={24} className="text-[#13202e] shrink-0 mt-0.5" strokeWidth={2.5} />
                  <p className="text-sm font-bold text-[#13202e] leading-snug">
                    {results.message || NUTRITION_APP.success.messageFallback}
                  </p>
                </div>

                <button 
                  onClick={resetApp}
                  className="w-full bg-[#de4b28] text-white font-black uppercase tracking-wider py-4 rounded-xl flex items-center justify-center gap-2 mt-6 border-4 border-[#13202e] shadow-[4px_4px_0px_#13202e] hover:bg-[#c43f20] active:shadow-none active:translate-y-1 active:translate-x-1 transition-all"
                >
                  <Camera size={20} strokeWidth={3} />
                  {NUTRITION_APP.success.cta}
                </button>
              </div>
            )}

            {status === "NO_FOOD" && (
              <div className="flex flex-col h-full space-y-6 text-center py-4">
                <div className="w-24 h-24 bg-[#61859b] text-[#f2ead6] rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-[#13202e] shadow-[4px_4px_0px_#13202e]">
                  <ImageOff size={48} strokeWidth={2.5} aria-hidden />
                </div>

                <div>
                  <h3 className="text-3xl font-black uppercase text-[#13202e] mb-3">
                    {NUTRITION_APP.noFood.title}
                  </h3>
                  <p className="text-[#3c556b] font-bold text-base leading-relaxed max-w-[280px] mx-auto">
                    {results.message || NUTRITION_APP.noFood.messageFallback}
                  </p>
                </div>

                <button
                  onClick={resetApp}
                  className="w-full bg-[#13202e] text-[#f2ead6] font-black uppercase tracking-wider py-5 rounded-xl flex items-center justify-center gap-2 mt-6 hover:bg-black transition-colors border-2 border-[#13202e] shadow-[4px_4px_0px_#13202e] active:shadow-none active:translate-y-1 active:translate-x-1"
                >
                  <Camera size={20} strokeWidth={3} />
                  {NUTRITION_APP.noFood.cta}
                </button>
              </div>
            )}

            {status === "ERROR" && (
              <div className="flex flex-col h-full space-y-6 text-center py-4">
                <div className="w-24 h-24 bg-[#de4b28] text-white rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-[#13202e] shadow-[4px_4px_0px_#13202e]">
                  <AlertTriangle size={48} strokeWidth={2.5} />
                </div>
                
                <div>
                  <h3 className="text-3xl font-black uppercase text-[#13202e] mb-3">
                    {NUTRITION_APP.error.title}
                  </h3>
                  <p className="text-[#3c556b] font-bold text-base leading-relaxed max-w-[280px] mx-auto">
                    {NUTRITION_APP.error.body}
                  </p>
                </div>

                <button 
                  onClick={resetApp}
                  className="w-full bg-[#13202e] text-[#f2ead6] font-black uppercase tracking-wider py-5 rounded-xl flex items-center justify-center gap-2 mt-6 hover:bg-black transition-colors border-2 border-[#13202e] shadow-[4px_4px_0px_#13202e] active:shadow-none active:translate-y-1 active:translate-x-1"
                >
                  <RefreshCcw size={20} strokeWidth={3} />
                  {NUTRITION_APP.error.cta}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
