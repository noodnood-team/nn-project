"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, Camera, Flame, Activity, AlertTriangle, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type AppState = "IDLE" | "ANALYZING" | "SUCCESS" | "ERROR";

interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface AnalyzeResponse {
  ok: boolean;
  prediction?: Macros | null;
  message?: string;
}

export default function NutritionApp() {
  const [status, setStatus] = useState<AppState>("IDLE");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [results, setResults] = useState<AnalyzeResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setImageFile(file);
    setImagePreview(previewUrl);
    setStatus("ANALYZING");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/v1/predict", {
        method: "POST",
        body: formData,
      });

      const data: AnalyzeResponse = await response.json();
      setResults(data);
      
      if (response.ok && data.ok) {
        setStatus("SUCCESS");
      } else {
        setStatus("ERROR");
      }
    } catch (err) {
      setResults({
        ok: false,
        message: "Failed to connect to the analysis server. Please check your connection and try again."
      });
      setStatus("ERROR");
    }
  };

  const resetApp = () => {
    setStatus("IDLE");
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setResults(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div 
      className="relative flex flex-col w-full h-[100dvh] bg-gradient-to-b from-[#b5d5e2] to-[#7198ad] text-[#13202e] overflow-hidden font-sans"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Navbar Section */}
      <div className="absolute top-0 left-0 right-0 z-50 p-6 flex justify-between items-start pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/logo.png" 
            alt="Noodnood Logo" 
            className="w-14 h-14 rounded-full border-4 border-[#13202e] shadow-[4px_4px_0px_#13202e] bg-[#f2ead6] object-cover" 
          />
          <span className="font-black uppercase tracking-tight text-[#13202e] text-lg bg-[#f2ead6] px-4 py-1.5 rounded-xl border-4 border-[#13202e] shadow-[4px_4px_0px_#13202e] mt-2">
            Noodnood
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
              alt="Food Preview"   
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
              className="w-full max-w-sm rounded-[32px] border-4 border-[#13202e] bg-[#f2ead6] p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#e8dec7] transition-colors shadow-[8px_8px_0px_#13202e]"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-20 h-20 rounded-full bg-[#13202e] text-[#f2ead6] flex items-center justify-center mb-6 shadow-inner">
                <Camera size={36} />
              </div>
              <h2 className="text-3xl font-black uppercase tracking-tight mb-2 text-[#13202e]">Scan Your Meal</h2>
              <p className="text-[#3c556b] font-medium text-sm mb-8 px-2">Take a photo to instantly calculate your strength fuel!</p>
              
              <button className="flex items-center justify-center gap-2 w-full bg-[#de4b28] text-white px-8 py-4 rounded-xl font-black uppercase tracking-wider text-sm border-2 border-[#13202e] hover:bg-[#c43f20] transition-colors shadow-[4px_4px_0px_#13202e] active:shadow-none active:translate-y-1 active:translate-x-1">
                <UploadCloud size={20} strokeWidth={3} />
                Select Photo
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
              <span className="font-black uppercase tracking-wider text-[#13202e]">Analyzing Fuel...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SUCCESS OR ERROR STATE: Bottom Sheet */}
      <AnimatePresence>
        {(status === "SUCCESS" || status === "ERROR") && results && (
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute z-30 bottom-0 left-0 right-0 bg-[#f2ead6] rounded-t-[40px] border-t-8 border-l-8 border-r-8 border-[#13202e] shadow-[0_-10px_30px_rgba(0,0,0,0.5)] p-8 overflow-y-auto max-h-[85vh]"
          >
            <div className="w-16 h-2 bg-[#13202e] rounded-full mx-auto mb-8 opacity-50" />
            
            {status === "SUCCESS" && results.prediction && (
              <div className="flex flex-col h-full space-y-6">
                <div className="flex justify-between items-end border-b-4 border-[#13202e] pb-4">
                  <div>
                    <h3 className="text-6xl font-black text-[#13202e] tracking-tighter">{results.prediction.calories}</h3>
                    <p className="text-sm font-bold uppercase tracking-widest text-[#de4b28] mt-2 flex items-center gap-1.5">
                      <Flame size={18} strokeWidth={3} /> Total Kcal
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center border-4 border-[#13202e] shadow-[4px_4px_0px_#13202e]">
                    <span className="text-[#13202e] font-black text-2xl sm:text-3xl">{results.prediction.protein}g</span>
                    <span className="text-[10px] sm:text-xs text-[#61859b] mt-1 uppercase tracking-black font-black">Protein</span>
                  </div>
                  <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center border-4 border-[#13202e] shadow-[4px_4px_0px_#13202e]">
                    <span className="text-[#13202e] font-black text-2xl sm:text-3xl">{results.prediction.carbs}g</span>
                    <span className="text-[10px] sm:text-xs text-[#61859b] mt-1 uppercase tracking-black font-black">Carbs</span>
                  </div>
                  <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center border-4 border-[#13202e] shadow-[4px_4px_0px_#13202e]">
                    <span className="text-[#13202e] font-black text-2xl sm:text-3xl">{results.prediction.fat}g</span>
                    <span className="text-[10px] sm:text-xs text-[#61859b] mt-1 uppercase tracking-black font-black">Fat</span>
                  </div>
                </div>

                <div className="bg-[#b5d5e2] border-4 border-[#13202e] rounded-xl p-4 flex items-start gap-3 mt-4 shadow-[4px_4px_0px_#13202e]">
                  <Activity size={24} className="text-[#13202e] shrink-0 mt-0.5" strokeWidth={2.5} />
                  <p className="text-sm font-bold text-[#13202e] leading-snug">
                    {results.message || "This is an estimate based on the photo."}
                  </p>
                </div>

                <button 
                  onClick={resetApp}
                  className="w-full bg-[#de4b28] text-white font-black uppercase tracking-wider py-4 rounded-xl flex items-center justify-center gap-2 mt-6 border-4 border-[#13202e] shadow-[4px_4px_0px_#13202e] hover:bg-[#c43f20] active:shadow-none active:translate-y-1 active:translate-x-1 transition-all"
                >
                  <Camera size={20} strokeWidth={3} />
                  Pump Up Again
                </button>
              </div>
            )}

            {status === "ERROR" && (
              <div className="flex flex-col h-full space-y-6 text-center py-4">
                <div className="w-24 h-24 bg-[#de4b28] text-white rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-[#13202e] shadow-[4px_4px_0px_#13202e]">
                  <AlertTriangle size={48} strokeWidth={2.5} />
                </div>
                
                <div>
                  <h3 className="text-3xl font-black uppercase text-[#13202e] mb-3">Analysis Failed</h3>
                  <p className="text-[#3c556b] font-bold text-base leading-relaxed max-w-[280px] mx-auto">
                    {results.message || "We encountered an issue processing your image."}
                  </p>
                </div>

                <button 
                  onClick={resetApp}
                  className="w-full bg-[#13202e] text-[#f2ead6] font-black uppercase tracking-wider py-5 rounded-xl flex items-center justify-center gap-2 mt-6 hover:bg-black transition-colors border-2 border-[#13202e] shadow-[4px_4px_0px_#13202e] active:shadow-none active:translate-y-1 active:translate-x-1"
                >
                  <RefreshCcw size={20} strokeWidth={3} />
                  Try Again
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
