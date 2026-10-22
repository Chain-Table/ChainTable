import React from "react";
import type { WildColor } from "../types/game";
import { useTranslation } from "react-i18next";

interface ColorPickerProps {
  isVisible: boolean;
  onColorSelect: (color: WildColor) => void;
}

const COLORS: { key: WildColor; nameKey: string; className: string }[] = [
  { key: "Red", nameKey: "color_red", className: "from-red-400 to-red-700 shadow-red-500/50" },
  { key: "Blue", nameKey: "color_blue", className: "from-blue-400 to-blue-700 shadow-blue-500/50" },
  { key: "Green", nameKey: "color_green", className: "from-green-400 to-green-700 shadow-green-500/50" },
  { key: "Yellow", nameKey: "color_yellow", className: "from-yellow-300 to-yellow-600 shadow-yellow-400/50" },
];

export const ColorPicker: React.FC<ColorPickerProps> = ({ isVisible, onColorSelect }) => {
  const { t } = useTranslation();
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="text-center animate-slide-in-up">
        <h3 className="text-3xl font-bold text-white mb-8">{t("choose_color")}</h3>
        <div className="grid grid-cols-2 gap-5">
          {COLORS.map(({ key, nameKey, className }) => (
            <button
              key={key}
              onClick={() => onColorSelect(key)}
              aria-label={t(nameKey)}
              className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br shadow-2xl ring-4 ring-white/10 hover:ring-white/70 hover:scale-110 transition-all flex items-end justify-center pb-4 ${className}`}
            >
              <span className="text-white font-bold drop-shadow">{t(nameKey)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;
