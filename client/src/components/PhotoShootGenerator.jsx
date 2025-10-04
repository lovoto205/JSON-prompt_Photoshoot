import React, { useState, useEffect, useRef } from "react";
import { HexColorPicker } from "react-colorful";
import parameters from "../data/parameters.json";
import translations from "../data/translations.json";
import "./PhotoShootGenerator.css";

export default function PhotoShootGenerator() {
  const [language, setLanguage] = useState("ru");
  const t = translations[language];

  // Функция для получения перевода параметра
  const getParamTranslation = (paramKey) => {
    const param = parameters[paramKey];
    if (!param) return paramKey;
    return language === "en" && param.translationEn ? param.translationEn : param.translation;
  };
  const [values, setValues] = useState({
    // Модель
    GENDER: "",
    AGE: "",
    WEIGHT_KG: "",
    BODY_TYPE: "",
    MODEL_ANGLE: [],
    POSE: "",
    FACIAL_EXPRESSION: "",
    EYE_CONTACT: "",
    MAKEUP_STYLE: "",
    HAIR_STYLE: "",
    // Камера
    CAMERA_MODEL: "",
    LENS_TYPE: "",
    FOCAL_LENGTH: "",
    APERTURE: "",
    SHUTTER_SPEED: "",
    ISO: "",
    DEPTH_OF_FIELD: "",
    CAMERA_ANGLE: "",
    SHOT_TYPE: "",
    // Освещение
    LIGHTING_SETUP: [],
    LIGHT_DIRECTION: "",
    LIGHT_TEMPERATURE: "",
    LIGHT_INTENSITY: "",
    // Стиль
    PHOTO_STYLE: [],
    FAMOUS_PHOTOGRAPHER_STYLE: "",
    COMPOSITION_RULE: "",
    FRAMING: "",
    // Одежда
    OUTFIT_STYLE: "",
    OUTFIT_MATERIAL: [],
    OUTFIT_FIT: "",
    COLOR_PALETTE: [],
    HEADWEAR: "",
    TOP: [],
    BOTTOM: "",
    FOOTWEAR: "",
    ACCESSORIES: [],
    // Локация
    LOCATION_TYPE: "",
    COUNTRY: "",
    BACKGROUND_TYPE: "",
    BACKGROUND_COLORS: [],
    SEASON: "",
    TIME_OF_DAY: "",
    WEATHER: "",
    // Атмосфера
    MOOD_ATMOSPHERE: [],
    POST_PROCESSING: [],
    SKIN_RETOUCHING: "",
    // Качество
    IMAGE_QUALITY: [],
    RESOLUTION: "",
    ASPECT_RATIO: "",
    NEGATIVE_PROMPTS: []
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [customInputMode, setCustomInputMode] = useState({});
  const [prompt, setPrompt] = useState("");
  const [copied, setCopied] = useState(false);
  const [translationCache, setTranslationCache] = useState({});
  const [debounceTimer, setDebounceTimer] = useState(null);
  const [colorPickerState, setColorPickerState] = useState({ isOpen: false, slotIndex: null, tempColor: "#000000", paramKey: null });
  const [dropdownMaxHeight, setDropdownMaxHeight] = useState({});
  const [showBackgroundColorPicker, setShowBackgroundColorPicker] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showDonateModal, setShowDonateModal] = useState(false);

  const dropdownRefs = useRef({});

  const steps = [
    {
      id: 0,
      name: t.navigation.model,
      icon: "user",
      fields: ["GENDER", "AGE", "WEIGHT_KG", "BODY_TYPE", "MODEL_ANGLE", "POSE", "FACIAL_EXPRESSION", "EYE_CONTACT", "MAKEUP_STYLE", "HAIR_STYLE"]
    },
    {
      id: 1,
      name: t.navigation.camera,
      icon: "camera",
      fields: ["CAMERA_MODEL", "LENS_TYPE", "FOCAL_LENGTH", "APERTURE", "SHUTTER_SPEED", "ISO", "DEPTH_OF_FIELD", "CAMERA_ANGLE", "SHOT_TYPE"]
    },
    {
      id: 2,
      name: t.navigation.lighting,
      icon: "sun",
      fields: ["LIGHTING_SETUP", "LIGHT_DIRECTION", "LIGHT_TEMPERATURE", "LIGHT_INTENSITY"]
    },
    {
      id: 3,
      name: t.navigation.style,
      icon: "frame",
      fields: ["PHOTO_STYLE", "FAMOUS_PHOTOGRAPHER_STYLE", "COMPOSITION_RULE", "FRAMING"]
    },
    {
      id: 4,
      name: t.navigation.clothing,
      icon: "shirt",
      fields: ["OUTFIT_STYLE", "OUTFIT_MATERIAL", "OUTFIT_FIT", "COLOR_PALETTE", "HEADWEAR", "TOP", "BOTTOM", "FOOTWEAR", "ACCESSORIES"]
    },
    {
      id: 5,
      name: t.navigation.location,
      icon: "map",
      fields: ["LOCATION_TYPE", "COUNTRY", "BACKGROUND_TYPE", "SEASON", "TIME_OF_DAY", "WEATHER"]
    },
    {
      id: 6,
      name: t.navigation.atmosphere,
      icon: "masks",
      fields: ["MOOD_ATMOSPHERE", "POST_PROCESSING", "SKIN_RETOUCHING"]
    },
    {
      id: 7,
      name: t.navigation.quality,
      icon: "settings",
      fields: ["IMAGE_QUALITY", "RESOLUTION", "ASPECT_RATIO", "NEGATIVE_PROMPTS"]
    }
  ];

  // Иконки в стиле line-art
  const icons = {
    user: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    camera: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    shirt: (
      <svg className="w-6 h-6" viewBox="0 0 50 50" fill="currentColor">
        <path d="M15.984375 3.9863281 A 1.0001 1.0001 0 0 0 15 5L15 5.625C11.080936 5.3543248 7.3892731 4.9670695 4.1679688 4.4199219 A 1.0001 1.0001 0 1 0 3.8320312 6.390625C7.16588 6.9568886 10.972771 7.3509043 15 7.625L15 11.150391L12.755859 11.748047L12.744141 11.75 A 1.0001 1.0001 0 0 0 12.548828 11.824219C12.219202 11.902059 9.6827039 12.532181 8.3085938 14.796875C6.4374054 17.878479 3.3457031 23.013672 3.3457031 23.013672 A 1.0001 1.0001 0 0 0 3.6484375 24.363281L9.0332031 27.941406 A 1.0001 1.0001 0 0 0 10.40625 27.681641L12.248047 25.041016C13.03783 31.366218 13.302802 38.426646 12.019531 44.802734 A 1.0001 1.0001 0 0 0 12.292969 45.707031C12.800249 46.214312 13.449047 46.507906 14.25 46.791016C15.050953 47.074126 16.006361 47.314503 17.082031 47.519531C19.233372 47.929588 21.859302 48.194359 24.529297 48.269531C27.199292 48.344701 29.907029 48.229901 32.226562 47.855469C34.546096 47.481033 36.491162 46.922901 37.707031 45.707031 A 1.0001 1.0001 0 0 0 37.990234 44.853516C36.943008 37.744458 36.767331 31.034131 37.644531 24.806641L39.646484 27.636719 A 1.0001 1.0001 0 0 0 41.015625 27.892578L46.349609 24.363281 A 1.0001 1.0001 0 0 0 46.654297 23.013672C46.654297 23.013672 43.563912 17.879016 41.691406 14.796875L41.691406 14.794922C40.317719 12.532404 37.785135 11.902567 37.453125 11.824219C37.452513 11.824074 37.447866 11.822466 37.447266 11.822266 A 1.0001 1.0001 0 0 0 37.255859 11.75L37.244141 11.748047L35 11.150391L35 7.625C39.027229 7.3509043 42.83412 6.9568886 46.167969 6.390625 A 1.0001 1.0001 0 1 0 45.832031 4.4199219C42.610727 4.9670695 38.919064 5.3543248 35 5.625L35 5 A 1.0001 1.0001 0 1 0 33 5L33 5.6992188C30.391764 5.8422774 27.794336 6 25 6C22.205664 6 19.608236 5.8422773 17 5.6992188L17 5 A 1.0001 1.0001 0 0 0 15.984375 3.9863281 z M 17 7.6992188C19.612537 7.840365 22.207746 8 25 8C27.792254 8 30.387463 7.840365 33 7.6992188L33 10.619141L30.869141 10.052734 A 1.0001 1.0001 0 0 0 30.597656 10.001953 A 1.0001 1.0001 0 0 0 30.537109 10L30.498047 10L19.472656 10L19.462891 10 A 1.0001 1.0001 0 0 0 19.373047 10.003906 A 1.0001 1.0001 0 0 0 19.136719 10.050781L17 10.619141L17 7.6992188 z M 20.970703 12L29.029297 12C28.915425 12.250069 28.983667 12.274247 28.777344 12.558594C28.143356 13.432337 27.127705 14.292969 25 14.292969C22.872295 14.292969 21.856644 13.432337 21.222656 12.558594C21.016334 12.274247 21.084575 12.250069 20.970703 12 z M 18.816406 12.207031C18.988802 12.660714 19.204099 13.183911 19.603516 13.734375C20.527028 15.007132 22.281705 16.292969 25 16.292969C27.718295 16.292969 29.472972 15.007132 30.396484 13.734375C30.795901 13.183911 31.011198 12.660714 31.183594 12.207031L33 12.689453L33 13 A 1.0001 1.0001 0 0 0 34.978516 13.214844L35.666016 13.396484C35.376377 14.239345 35.076172 15.417848 35.076172 17.009766C35.076172 18.81636 35.319844 20.193411 35.572266 21.132812C35.759994 21.831456 35.882859 22.044601 35.978516 22.25C34.684928 29.158164 34.852475 36.636424 35.955078 44.478516C35.231164 45.016377 33.823193 45.571728 31.908203 45.880859C29.769268 46.226142 27.159318 46.341984 24.585938 46.269531C22.012556 46.197081 19.468909 45.938161 17.457031 45.554688C16.451092 45.362949 15.576934 45.13791 14.916016 44.904297C14.457932 44.74238 14.286591 44.611173 14.078125 44.480469C15.433594 37.135479 15.067512 29.077551 14.011719 22.275391C14.104129 22.078701 14.235699 21.84738 14.427734 21.132812C14.680171 20.193492 14.923828 18.816834 14.923828 17.009766C14.923828 15.417848 14.623623 14.239345 14.333984 13.396484L15.021484 13.214844 A 1.0001 1.0001 0 0 0 17 13L17 12.689453L18.816406 12.207031 z M 12.441406 14.021484C12.6726 14.673373 12.923828 15.611091 12.923828 17.009766C12.923828 18.637697 12.705157 19.837305 12.496094 20.615234C12.28703 21.393163 12.119141 21.689453 12.119141 21.689453 A 1.0001 1.0001 0 0 0 12.054688 21.839844 A 1.0001 1.0001 0 0 0 11.958984 21.958984L9.3261719 25.734375L5.5546875 23.228516C6.070338 22.372228 8.3384755 18.604417 10.019531 15.835938 A 1.0001 1.0001 0 0 0 10.019531 15.833984C10.618798 14.846323 11.687437 14.328134 12.441406 14.021484 z M 37.558594 14.021484C38.31248 14.327843 39.381257 14.846414 39.980469 15.833984C41.661412 18.6008 43.926019 22.365262 44.443359 23.224609L40.71875 25.689453L37.871094 21.660156C37.862394 21.644406 37.707323 21.370309 37.503906 20.613281C37.294828 19.835183 37.076172 18.637171 37.076172 17.009766C37.076172 15.611091 37.3274 14.673373 37.558594 14.021484 z" />
      </svg>
    ),
    map: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
    masks: (
      <svg className="w-6 h-6" viewBox="0 0 50 50" fill="currentColor">
        <path d="M20.75 0C20.300781 0 19.835938 0.0273438 19.34375 0.0625C17.371094 0.199219 15.027344 0.636719 12.28125 1.5625C6.742188 3.460938 3.648438 5.886719 1.96875 7.90625C1.128906 8.914063 0.65625 9.800781 0.375 10.46875C0.09375 11.136719 0 11.65625 0 11.65625L-0.03125 11.90625L0.0625 12.125C5.136719 27.449219 12.984375 32.609375 18.0625 34.21875C17.777344 37.105469 17.976563 39.578125 18.4375 41.625C19.621094 46.890625 22.53125 49.46875 22.53125 49.46875L22.71875 49.59375L22.90625 49.65625C22.90625 49.65625 26.667969 50.765625 31.84375 49.03125C37.019531 47.296875 43.683594 42.769531 49.875 31.90625L50 31.6875L50 31.46875C50 31.46875 50.019531 30.953125 49.875 30.25C49.730469 29.546875 49.414063 28.570313 48.78125 27.4375C47.515625 25.167969 44.953125 22.257813 39.875 19.4375C36.300781 17.433594 33.332031 16.519531 30.96875 16.1875C30.796875 12.347656 30.058594 7.800781 28.25 2.5625L28.15625 2.34375L28 2.1875C28 2.1875 27.625 1.835938 27 1.46875C26.375 1.101563 25.457031 0.671875 24.1875 0.375C23.234375 0.152344 22.09375 0 20.75 0 Z M 20.75 2C21.945313 2 22.917969 2.125 23.71875 2.3125C24.785156 2.5625 25.539063 2.917969 26 3.1875C26.316406 3.375 26.335938 3.410156 26.40625 3.46875C28.046875 8.296875 28.78125 12.492188 28.96875 16.03125C28.765625 16.03125 28.5625 16.023438 28.375 16.03125C27.0625 16.078125 26.0625 16.328125 25.375 16.5625C24.6875 16.796875 24.25 17.0625 24.25 17.0625L24.0625 17.1875L23.9375 17.40625C23.171875 18.761719 22.503906 20.078125 21.90625 21.34375C21.066406 21.386719 20.097656 21.507813 19 21.84375L18.96875 21.84375C14.917969 23.265625 13.5625 26.4375 13.5625 26.4375C13.355469 26.957031 13.605469 27.542969 14.125 27.75C14.644531 27.957031 15.230469 27.707031 15.4375 27.1875C15.4375 27.1875 16.269531 24.929688 19.59375 23.75C19.605469 23.746094 19.613281 23.753906 19.625 23.75C20.09375 23.605469 20.527344 23.535156 20.9375 23.46875C19.585938 26.683594 18.75 29.59375 18.3125 32.1875C13.832031 30.664063 6.859375 26.023438 2.0625 11.78125C2.078125 11.707031 2.058594 11.628906 2.21875 11.25C2.425781 10.753906 2.820313 10.039063 3.53125 9.1875C4.949219 7.484375 7.667969 5.238281 12.90625 3.4375C12.917969 3.433594 12.925781 3.441406 12.9375 3.4375C16.179688 2.351563 18.757813 1.996094 20.75 2 Z M 19.40625 12.3125C18.644531 12.335938 18.09375 12.40625 18.09375 12.40625C18.09375 12.40625 19.292969 15.386719 21.59375 15.6875C23.195313 15.886719 25.5 13.3125 25.5 13.3125C25.5 13.3125 23.898438 12.605469 22 12.40625C21.148438 12.304688 20.167969 12.289063 19.40625 12.3125 Z M 14 13.6875C14 13.6875 12.105469 14.894531 10.90625 16.09375C9.507813 17.492188 8.6875 18.90625 8.6875 18.90625C8.6875 18.90625 12.085938 19.699219 13.1875 18.5C14.789063 16.800781 14 13.6875 14 13.6875 Z M 28.46875 18.03125C30.691406 17.949219 34.136719 18.511719 38.90625 21.1875C43.726563 23.867188 45.96875 26.5 47.03125 28.40625C47.5625 29.359375 47.800781 30.140625 47.90625 30.65625C47.980469 31.007813 47.96875 31.035156 47.96875 31.125C42.007813 41.46875 35.855469 45.570313 31.21875 47.125C26.789063 48.609375 24.015625 47.867188 23.71875 47.78125C23.507813 47.59375 21.421875 45.695313 20.40625 41.1875C19.960938 39.210938 19.773438 36.761719 20.125 33.8125C20.1875 33.652344 20.210938 33.480469 20.1875 33.3125C20.59375 30.386719 21.539063 26.953125 23.3125 23.03125C23.324219 23.011719 23.335938 22.988281 23.34375 22.96875C23.347656 22.957031 23.371094 22.949219 23.375 22.9375C23.492188 22.792969 23.570313 22.621094 23.59375 22.4375C24.160156 21.222656 24.796875 19.96875 25.53125 18.65625C25.609375 18.613281 25.65625 18.5625 26.03125 18.4375C26.546875 18.261719 27.355469 18.070313 28.46875 18.03125 Z M 28.71875 25.625C27.003906 25.597656 25.09375 26.40625 25.09375 26.40625C25.09375 26.40625 26.695313 27.386719 28.59375 28.1875C30.394531 28.988281 32.40625 29.6875 32.40625 29.6875C32.40625 29.6875 31.8125 26.898438 30.3125 26C29.863281 25.75 29.289063 25.632813 28.71875 25.625 Z M 37.21875 30.625C36.0625 30.699219 35 31.09375 35 31.09375L38.1875 33.6875C39.886719 34.886719 41.59375 35.6875 41.59375 35.6875C41.59375 35.6875 40.988281 32 39.1875 31C38.625 30.664063 37.914063 30.582031 37.21875 30.625 Z M 24.34375 30.90625C23.945313 30.96875 23.625 31.265625 23.53125 31.65625C23.53125 31.65625 23.007813 33.75 23.0625 36.21875C23.117188 38.6875 23.75 41.773438 26.40625 43.28125C29.066406 44.792969 32.027344 43.738281 34.1875 42.5C36.347656 41.261719 37.90625 39.71875 37.90625 39.71875C38.167969 39.460938 38.265625 39.078125 38.160156 38.726563C38.054688 38.375 37.765625 38.105469 37.40625 38.03125C37.40625 38.03125 32.671875 36.953125 30.5625 35.8125C28.496094 34.691406 25.25 31.21875 25.25 31.21875C25.019531 30.96875 24.679688 30.847656 24.34375 30.90625 Z M 25.28125 34.125C26.445313 35.28125 27.984375 36.703125 29.625 37.59375C31.285156 38.492188 33.332031 39.0625 34.9375 39.46875C34.347656 39.960938 34.183594 40.210938 33.1875 40.78125C31.296875 41.867188 29.144531 42.519531 27.40625 41.53125C25.660156 40.539063 25.109375 38.34375 25.0625 36.1875C25.039063 35.082031 25.167969 34.871094 25.28125 34.125Z" />
      </svg>
    ),
    sun: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    palette: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
    frame: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    settings: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    sparkles: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    )
  };

  const iconLarge = {
    user: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    camera: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    shirt: (
      <svg className="w-full h-full" viewBox="0 0 50 50" fill="currentColor">
        <path d="M15.984375 3.9863281 A 1.0001 1.0001 0 0 0 15 5L15 5.625C11.080936 5.3543248 7.3892731 4.9670695 4.1679688 4.4199219 A 1.0001 1.0001 0 1 0 3.8320312 6.390625C7.16588 6.9568886 10.972771 7.3509043 15 7.625L15 11.150391L12.755859 11.748047L12.744141 11.75 A 1.0001 1.0001 0 0 0 12.548828 11.824219C12.219202 11.902059 9.6827039 12.532181 8.3085938 14.796875C6.4374054 17.878479 3.3457031 23.013672 3.3457031 23.013672 A 1.0001 1.0001 0 0 0 3.6484375 24.363281L9.0332031 27.941406 A 1.0001 1.0001 0 0 0 10.40625 27.681641L12.248047 25.041016C13.03783 31.366218 13.302802 38.426646 12.019531 44.802734 A 1.0001 1.0001 0 0 0 12.292969 45.707031C12.800249 46.214312 13.449047 46.507906 14.25 46.791016C15.050953 47.074126 16.006361 47.314503 17.082031 47.519531C19.233372 47.929588 21.859302 48.194359 24.529297 48.269531C27.199292 48.344701 29.907029 48.229901 32.226562 47.855469C34.546096 47.481033 36.491162 46.922901 37.707031 45.707031 A 1.0001 1.0001 0 0 0 37.990234 44.853516C36.943008 37.744458 36.767331 31.034131 37.644531 24.806641L39.646484 27.636719 A 1.0001 1.0001 0 0 0 41.015625 27.892578L46.349609 24.363281 A 1.0001 1.0001 0 0 0 46.654297 23.013672C46.654297 23.013672 43.563912 17.879016 41.691406 14.796875L41.691406 14.794922C40.317719 12.532404 37.785135 11.902567 37.453125 11.824219C37.452513 11.824074 37.447866 11.822466 37.447266 11.822266 A 1.0001 1.0001 0 0 0 37.255859 11.75L37.244141 11.748047L35 11.150391L35 7.625C39.027229 7.3509043 42.83412 6.9568886 46.167969 6.390625 A 1.0001 1.0001 0 1 0 45.832031 4.4199219C42.610727 4.9670695 38.919064 5.3543248 35 5.625L35 5 A 1.0001 1.0001 0 1 0 33 5L33 5.6992188C30.391764 5.8422774 27.794336 6 25 6C22.205664 6 19.608236 5.8422773 17 5.6992188L17 5 A 1.0001 1.0001 0 0 0 15.984375 3.9863281 z M 17 7.6992188C19.612537 7.840365 22.207746 8 25 8C27.792254 8 30.387463 7.840365 33 7.6992188L33 10.619141L30.869141 10.052734 A 1.0001 1.0001 0 0 0 30.597656 10.001953 A 1.0001 1.0001 0 0 0 30.537109 10L30.498047 10L19.472656 10L19.462891 10 A 1.0001 1.0001 0 0 0 19.373047 10.003906 A 1.0001 1.0001 0 0 0 19.136719 10.050781L17 10.619141L17 7.6992188 z M 20.970703 12L29.029297 12C28.915425 12.250069 28.983667 12.274247 28.777344 12.558594C28.143356 13.432337 27.127705 14.292969 25 14.292969C22.872295 14.292969 21.856644 13.432337 21.222656 12.558594C21.016334 12.274247 21.084575 12.250069 20.970703 12 z M 18.816406 12.207031C18.988802 12.660714 19.204099 13.183911 19.603516 13.734375C20.527028 15.007132 22.281705 16.292969 25 16.292969C27.718295 16.292969 29.472972 15.007132 30.396484 13.734375C30.795901 13.183911 31.011198 12.660714 31.183594 12.207031L33 12.689453L33 13 A 1.0001 1.0001 0 0 0 34.978516 13.214844L35.666016 13.396484C35.376377 14.239345 35.076172 15.417848 35.076172 17.009766C35.076172 18.81636 35.319844 20.193411 35.572266 21.132812C35.759994 21.831456 35.882859 22.044601 35.978516 22.25C34.684928 29.158164 34.852475 36.636424 35.955078 44.478516C35.231164 45.016377 33.823193 45.571728 31.908203 45.880859C29.769268 46.226142 27.159318 46.341984 24.585938 46.269531C22.012556 46.197081 19.468909 45.938161 17.457031 45.554688C16.451092 45.362949 15.576934 45.13791 14.916016 44.904297C14.457932 44.74238 14.286591 44.611173 14.078125 44.480469C15.433594 37.135479 15.067512 29.077551 14.011719 22.275391C14.104129 22.078701 14.235699 21.84738 14.427734 21.132812C14.680171 20.193492 14.923828 18.816834 14.923828 17.009766C14.923828 15.417848 14.623623 14.239345 14.333984 13.396484L15.021484 13.214844 A 1.0001 1.0001 0 0 0 17 13L17 12.689453L18.816406 12.207031 z M 12.441406 14.021484C12.6726 14.673373 12.923828 15.611091 12.923828 17.009766C12.923828 18.637697 12.705157 19.837305 12.496094 20.615234C12.28703 21.393163 12.119141 21.689453 12.119141 21.689453 A 1.0001 1.0001 0 0 0 12.054688 21.839844 A 1.0001 1.0001 0 0 0 11.958984 21.958984L9.3261719 25.734375L5.5546875 23.228516C6.070338 22.372228 8.3384755 18.604417 10.019531 15.835938 A 1.0001 1.0001 0 0 0 10.019531 15.833984C10.618798 14.846323 11.687437 14.328134 12.441406 14.021484 z M 37.558594 14.021484C38.31248 14.327843 39.381257 14.846414 39.980469 15.833984C41.661412 18.6008 43.926019 22.365262 44.443359 23.224609L40.71875 25.689453L37.871094 21.660156C37.862394 21.644406 37.707323 21.370309 37.503906 20.613281C37.294828 19.835183 37.076172 18.637171 37.076172 17.009766C37.076172 15.611091 37.3274 14.673373 37.558594 14.021484 z" />
      </svg>
    ),
    map: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
    masks: (
      <svg className="w-full h-full" viewBox="0 0 50 50" fill="currentColor">
        <path d="M20.75 0C20.300781 0 19.835938 0.0273438 19.34375 0.0625C17.371094 0.199219 15.027344 0.636719 12.28125 1.5625C6.742188 3.460938 3.648438 5.886719 1.96875 7.90625C1.128906 8.914063 0.65625 9.800781 0.375 10.46875C0.09375 11.136719 0 11.65625 0 11.65625L-0.03125 11.90625L0.0625 12.125C5.136719 27.449219 12.984375 32.609375 18.0625 34.21875C17.777344 37.105469 17.976563 39.578125 18.4375 41.625C19.621094 46.890625 22.53125 49.46875 22.53125 49.46875L22.71875 49.59375L22.90625 49.65625C22.90625 49.65625 26.667969 50.765625 31.84375 49.03125C37.019531 47.296875 43.683594 42.769531 49.875 31.90625L50 31.6875L50 31.46875C50 31.46875 50.019531 30.953125 49.875 30.25C49.730469 29.546875 49.414063 28.570313 48.78125 27.4375C47.515625 25.167969 44.953125 22.257813 39.875 19.4375C36.300781 17.433594 33.332031 16.519531 30.96875 16.1875C30.796875 12.347656 30.058594 7.800781 28.25 2.5625L28.15625 2.34375L28 2.1875C28 2.1875 27.625 1.835938 27 1.46875C26.375 1.101563 25.457031 0.671875 24.1875 0.375C23.234375 0.152344 22.09375 0 20.75 0 Z M 20.75 2C21.945313 2 22.917969 2.125 23.71875 2.3125C24.785156 2.5625 25.539063 2.917969 26 3.1875C26.316406 3.375 26.335938 3.410156 26.40625 3.46875C28.046875 8.296875 28.78125 12.492188 28.96875 16.03125C28.765625 16.03125 28.5625 16.023438 28.375 16.03125C27.0625 16.078125 26.0625 16.328125 25.375 16.5625C24.6875 16.796875 24.25 17.0625 24.25 17.0625L24.0625 17.1875L23.9375 17.40625C23.171875 18.761719 22.503906 20.078125 21.90625 21.34375C21.066406 21.386719 20.097656 21.507813 19 21.84375L18.96875 21.84375C14.917969 23.265625 13.5625 26.4375 13.5625 26.4375C13.355469 26.957031 13.605469 27.542969 14.125 27.75C14.644531 27.957031 15.230469 27.707031 15.4375 27.1875C15.4375 27.1875 16.269531 24.929688 19.59375 23.75C19.605469 23.746094 19.613281 23.753906 19.625 23.75C20.09375 23.605469 20.527344 23.535156 20.9375 23.46875C19.585938 26.683594 18.75 29.59375 18.3125 32.1875C13.832031 30.664063 6.859375 26.023438 2.0625 11.78125C2.078125 11.707031 2.058594 11.628906 2.21875 11.25C2.425781 10.753906 2.820313 10.039063 3.53125 9.1875C4.949219 7.484375 7.667969 5.238281 12.90625 3.4375C12.917969 3.433594 12.925781 3.441406 12.9375 3.4375C16.179688 2.351563 18.757813 1.996094 20.75 2 Z M 19.40625 12.3125C18.644531 12.335938 18.09375 12.40625 18.09375 12.40625C18.09375 12.40625 19.292969 15.386719 21.59375 15.6875C23.195313 15.886719 25.5 13.3125 25.5 13.3125C25.5 13.3125 23.898438 12.605469 22 12.40625C21.148438 12.304688 20.167969 12.289063 19.40625 12.3125 Z M 14 13.6875C14 13.6875 12.105469 14.894531 10.90625 16.09375C9.507813 17.492188 8.6875 18.90625 8.6875 18.90625C8.6875 18.90625 12.085938 19.699219 13.1875 18.5C14.789063 16.800781 14 13.6875 14 13.6875 Z M 28.46875 18.03125C30.691406 17.949219 34.136719 18.511719 38.90625 21.1875C43.726563 23.867188 45.96875 26.5 47.03125 28.40625C47.5625 29.359375 47.800781 30.140625 47.90625 30.65625C47.980469 31.007813 47.96875 31.035156 47.96875 31.125C42.007813 41.46875 35.855469 45.570313 31.21875 47.125C26.789063 48.609375 24.015625 47.867188 23.71875 47.78125C23.507813 47.59375 21.421875 45.695313 20.40625 41.1875C19.960938 39.210938 19.773438 36.761719 20.125 33.8125C20.1875 33.652344 20.210938 33.480469 20.1875 33.3125C20.59375 30.386719 21.539063 26.953125 23.3125 23.03125C23.324219 23.011719 23.335938 22.988281 23.34375 22.96875C23.347656 22.957031 23.371094 22.949219 23.375 22.9375C23.492188 22.792969 23.570313 22.621094 23.59375 22.4375C24.160156 21.222656 24.796875 19.96875 25.53125 18.65625C25.609375 18.613281 25.65625 18.5625 26.03125 18.4375C26.546875 18.261719 27.355469 18.070313 28.46875 18.03125 Z M 28.71875 25.625C27.003906 25.597656 25.09375 26.40625 25.09375 26.40625C25.09375 26.40625 26.695313 27.386719 28.59375 28.1875C30.394531 28.988281 32.40625 29.6875 32.40625 29.6875C32.40625 29.6875 31.8125 26.898438 30.3125 26C29.863281 25.75 29.289063 25.632813 28.71875 25.625 Z M 37.21875 30.625C36.0625 30.699219 35 31.09375 35 31.09375L38.1875 33.6875C39.886719 34.886719 41.59375 35.6875 41.59375 35.6875C41.59375 35.6875 40.988281 32 39.1875 31C38.625 30.664063 37.914063 30.582031 37.21875 30.625 Z M 24.34375 30.90625C23.945313 30.96875 23.625 31.265625 23.53125 31.65625C23.53125 31.65625 23.007813 33.75 23.0625 36.21875C23.117188 38.6875 23.75 41.773438 26.40625 43.28125C29.066406 44.792969 32.027344 43.738281 34.1875 42.5C36.347656 41.261719 37.90625 39.71875 37.90625 39.71875C38.167969 39.460938 38.265625 39.078125 38.160156 38.726563C38.054688 38.375 37.765625 38.105469 37.40625 38.03125C37.40625 38.03125 32.671875 36.953125 30.5625 35.8125C28.496094 34.691406 25.25 31.21875 25.25 31.21875C25.019531 30.96875 24.679688 30.847656 24.34375 30.90625 Z M 25.28125 34.125C26.445313 35.28125 27.984375 36.703125 29.625 37.59375C31.285156 38.492188 33.332031 39.0625 34.9375 39.46875C34.347656 39.960938 34.183594 40.210938 33.1875 40.78125C31.296875 41.867188 29.144531 42.519531 27.40625 41.53125C25.660156 40.539063 25.109375 38.34375 25.0625 36.1875C25.039063 35.082031 25.167969 34.871094 25.28125 34.125Z" />
      </svg>
    ),
    sun: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    palette: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
    frame: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    settings: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  };

  const inputStyles = "w-full px-3 py-2.5 pr-10 border border-gray-800 rounded-lg focus:border-gray-600 focus:ring-1 focus:ring-gray-600 transition-all outline-none bg-[#14161b] text-gray-100 cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.1)] text-sm";
  const customInputStyles = "w-full pl-3 pr-[4.5rem] py-2.5 border border-gray-600 rounded-lg focus:border-gray-500 focus:ring-1 focus:ring-gray-500 transition-all outline-none bg-[#14161b] text-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.1)] text-sm";

  // Функция перевода через LibreTranslate API
  const translateToEnglish = async (paramKey, ruValue) => {
    if (!ruValue) return "";

    const cleanValue = ruValue.trim().toLowerCase();
    console.log(`[Translate] Input: "${ruValue}" for ${paramKey}`);

    // Если текст полностью на латинице или цифры, возвращаем как есть
    if (/^[a-zA-Z0-9\s\-+.,]+$/.test(ruValue)) {
      console.log(`[Translate] Already English, skipping`);
      return ruValue;
    }

    // Проверяем кэш
    if (translationCache[ruValue]) {
      console.log(`[Translate] Found in cache: "${translationCache[ruValue]}"`);
      return translationCache[ruValue];
    }

    // Проверяем в базе examples
    const param = parameters[paramKey];
    if (param && param.examples) {
      const match = param.examples.find(ex => ex.ru.toLowerCase() === cleanValue);
      if (match) {
        console.log(`[Translate] Found in examples: "${match.en}"`);
        setTranslationCache(prev => ({ ...prev, [ruValue]: match.en }));
        return match.en;
      }
    }

    // Используем Google Translate напрямую (без backend)
    try {
      console.log(`[Translate] Calling Google Translate for: "${ruValue}"`);
      const encodedText = encodeURIComponent(ruValue);
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ru&tl=en&dt=t&q=${encodedText}`;

      const response = await fetch(url);
      const data = await response.json();

      // Google Translate возвращает массив [[["translated text", "original", null, null]], ...]
      if (data && data[0] && data[0][0] && data[0][0][0]) {
        const translation = data[0][0][0];
        console.log(`[Translate] Translated: "${ruValue}" -> "${translation}"`);

        // Сохраняем в кэш
        setTranslationCache(prev => ({ ...prev, [ruValue]: translation }));
        return translation;
      }

      // Если не удалось перевести, возвращаем оригинал
      console.log('[Translate] Translation failed, returning original');
      return ruValue;
    } catch (e) {
      console.error('[Translate] API error:', e);
      return ruValue;
    }
  };

  const handleChange = (key, value) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };

  const handleCheckboxChange = (key, value) => {
    setValues(prev => {
      const currentValues = prev[key] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return { ...prev, [key]: newValues };
    });
  };

  const handleColorSelect = (key, slotIndex, color) => {
    setValues(prev => {
      const currentColors = prev[key] || [];
      const newColors = [...currentColors];
      newColors[slotIndex] = color;
      return { ...prev, [key]: newColors };
    });
  };

  const openColorPicker = (slotIndex, currentColor) => {
    setColorPickerState({ isOpen: true, slotIndex, tempColor: currentColor || "#000000", paramKey: "COLOR_PALETTE" });
  };

  const closeColorPicker = () => {
    setColorPickerState({ isOpen: false, slotIndex: null, tempColor: "#000000", paramKey: null });
  };

  const applyColor = () => {
    const key = colorPickerState.paramKey || "COLOR_PALETTE";
    handleColorSelect(key, colorPickerState.slotIndex, colorPickerState.tempColor);
    closeColorPicker();
  };

  // Генерация промпта в реальном времени
  const generatePrompt = async () => {
    const promptData = {};

    // Автоматически обрабатываем все параметры из values
    for (const [paramKey, paramValue] of Object.entries(values)) {
      // Пропускаем пустые значения
      if (!paramValue || (Array.isArray(paramValue) && paramValue.length === 0)) continue;

      // Получаем информацию о параметре из parameters
      const param = parameters[paramKey];
      if (!param) continue;

      // Конвертируем ключ в snake_case для JSON
      const jsonKey = paramKey.toLowerCase();

      // Обрабатываем в зависимости от типа
      if (Array.isArray(paramValue)) {
        // Для массивов переводим каждый элемент
        const translated = await Promise.all(
          paramValue.filter(v => v).map(v => translateToEnglish(paramKey, v))
        );
        if (translated.length > 0) {
          promptData[jsonKey] = translated;
        }
      } else if (param.inputType === "colorPicker") {
        // Для цветов просто добавляем массив
        const colors = paramValue.filter(c => c);
        if (colors.length > 0) {
          promptData[jsonKey] = colors;
        }
      } else if (param.inputType === "text") {
        // Для текстовых полей (числа) добавляем как есть
        if (paramKey === "WEIGHT_KG") {
          promptData[jsonKey] = `${paramValue} kg`;
        } else if (paramKey === "AGE") {
          const translated = await translateToEnglish(paramKey, paramValue);
          if (translated) promptData[jsonKey] = `${translated} year old`;
        } else if (paramKey === "FOCAL_LENGTH") {
          promptData[jsonKey] = `${paramValue}mm`;
        } else {
          promptData[jsonKey] = paramValue;
        }
      } else {
        // Для одиночных значений переводим
        const translated = await translateToEnglish(paramKey, paramValue);
        if (translated && translated !== "none") {
          promptData[jsonKey] = translated;
        }
      }
    }

    // Формируем финальный JSON промпт
    if (Object.keys(promptData).length === 0) {
      return "";
    }

    const finalPrompt = {
      prompt: "Generate a professional photoshoot",
      parameters: promptData,
      instruction: "Keep the face unchanged and consistent."
    };

    return JSON.stringify(finalPrompt, null, 2);
  };

  // Обновляем промпт при изменении значений с debounce
  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      generatePrompt().then(newPrompt => setPrompt(newPrompt));
    }, 500); // Ждём 500мс после последнего изменения

    setDebounceTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [values]);

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.custom-select')) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        if (showPromptModal) setShowPromptModal(false);
        if (showHelpModal) setShowHelpModal(false);
        if (showDonateModal) setShowDonateModal(false);
        if (colorPickerState.isOpen) closeColorPicker();
      }
    };
    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [showPromptModal, showHelpModal, showDonateModal, colorPickerState.isOpen]);

  useEffect(() => {
    if (openDropdown && dropdownRefs.current[openDropdown]) {
      const dropdown = dropdownRefs.current[openDropdown];
      const rect = dropdown.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.top - 20; // 20px padding from bottom

      if (spaceBelow < 240) { // Default max-height is 240px (15rem)
        setDropdownMaxHeight(prev => ({ ...prev, [openDropdown]: `${spaceBelow}px` }));
      } else {
        setDropdownMaxHeight(prev => ({ ...prev, [openDropdown]: '15rem' }));
      }
    }
  }, [openDropdown]);

  const renderInput = (paramKey, placeholder = "") => {
    const param = parameters[paramKey];
    if (!param) return null;

    const isOpen = openDropdown === paramKey;
    const isCustom = customInputMode[paramKey];
    const currentValue = values[paramKey];
    const inputType = param.input;

    // Проверка на отключение полей при выборе "Студия"
    const isStudioSelected = values.LOCATION_TYPE === "Студия";
    const isWeatherField = ["SEASON", "TIME_OF_DAY", "WEATHER"].includes(paramKey);
    const isDisabled = isStudioSelected && isWeatherField;

    // Для полей text (возраст, вес) - только текстовое поле
    if (inputType === "text") {
      return (
        <div className="relative">
          <label className="block text-xs font-semibold text-gray-400 mb-1.5">
            {getParamTranslation(paramKey)}
          </label>
          <input
            type="text"
            value={currentValue}
            onChange={(e) => handleChange(paramKey, e.target.value)}
            placeholder="–"
            className="w-full px-3 py-2.5 border border-gray-800 rounded-lg focus:border-gray-600 focus:ring-1 focus:ring-gray-600 transition-all outline-none bg-[#14161b] text-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.1)] text-sm"
          />
        </div>
      );
    }

    // Для полей colorPicker (выбор цвета)
    if (inputType === "colorPicker") {
      const currentColors = currentValue || [];

      return (
        <div className="relative">
          <label className="block text-xs font-semibold text-gray-400 mb-1.5">
            {getParamTranslation(paramKey)}
          </label>
          <div className="flex gap-2 w-full">
            {[0, 1, 2, 3, 4].map((slotIndex) => (
              <div
                key={slotIndex}
                onClick={() => openColorPicker(slotIndex, currentColors[slotIndex])}
                className="color-square flex-1 border border-gray-800 rounded-lg focus:border-gray-600 transition-all outline-none bg-[#14161b] cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:border-gray-600"
                style={{ backgroundColor: currentColors[slotIndex] || "transparent", height: '48px' }}
                title={currentColors[slotIndex] || t.buttons.selectColor}
              ></div>
            ))}
          </div>
        </div>
      );
    }

    // Для полей checkbox (множественный выбор)
    if (inputType === "checkbox") {
      if (isCustom) {
        return (
          <div className="relative custom-select">
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">
              {getParamTranslation(paramKey)}
            </label>
            <div className="relative">
              <input
                type="text"
                value={customInputMode[`${paramKey}_value`] || ""}
                onChange={(e) => setCustomInputMode(prev => ({ ...prev, [`${paramKey}_value`]: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customInputMode[`${paramKey}_value`]) {
                    handleCheckboxChange(paramKey, customInputMode[`${paramKey}_value`]);
                    setCustomInputMode(prev => ({ ...prev, [`${paramKey}_value`]: "" }));
                  }
                }}
                placeholder={t.placeholders.enterValue}
                className={customInputStyles}
                style={{ fontSize: '11px' }}
                autoFocus
              />
              <button
                onClick={() => {
                  setCustomInputMode(prev => ({ ...prev, [paramKey]: false, [`${paramKey}_value`]: "" }));
                  setOpenDropdown(paramKey);
                }}
                className="absolute right-2 top-[0.8rem] text-xs text-gray-400 hover:text-gray-200 font-semibold"
              >
                {t.buttons.fromList}
              </button>
            </div>
            {currentValue.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {currentValue.map((val, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-gray-700 text-gray-200 text-xs rounded"
                  >
                    {val}
                    <button
                      onClick={() => handleCheckboxChange(paramKey, val)}
                      className="hover:text-red-400"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      }

      return (
        <div className="relative custom-select">
          <label className="block text-xs font-semibold text-gray-400 mb-1.5">
            {getParamTranslation(paramKey)}
          </label>
          <div
            onClick={() => setOpenDropdown(isOpen ? null : paramKey)}
            className={inputStyles}
          >
            <span className={currentValue.length > 0 ? "text-gray-100" : "text-gray-500"}>
              {currentValue.length > 0 ? `${t.selected}: ${currentValue.length}` : t.buttons.no}
            </span>
            <svg
              className="absolute right-3 top-[2.35rem] w-4 h-4 text-gray-500 pointer-events-none transition-transform"
              style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <polyline points="6 9 12 15 18 9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {isOpen && (
            <div
              ref={(el) => dropdownRefs.current[paramKey] = el}
              className="absolute z-50 w-full mt-1 bg-[#1a1d24] border border-gray-800 rounded-lg shadow-[0_0px_0px_rgba(0,0,0,0.2)] overflow-hidden"
              style={{ maxHeight: dropdownMaxHeight[paramKey] || '15rem' }}
            >
              <div className="custom-dropdown-scroll overflow-y-auto" style={{ marginRight: '2px', marginTop: '2px', marginBottom: '2px', maxHeight: `calc(${dropdownMaxHeight[paramKey] || '15rem'} - 4px)` }}>
              <div
                onClick={() => {
                  if (currentValue.length > 0) {
                    setValues(prev => ({ ...prev, [paramKey]: [] }));
                  }
                }}
                className={`px-3 py-2.5 ${currentValue.length > 0 ? 'hover:bg-[#14161b] cursor-pointer text-red-400' : 'cursor-default text-gray-600'} transition-colors text-sm border-b border-gray-800 font-semibold flex items-center gap-2`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
                {t.buttons.clearAll}
              </div>
              {param.examples.map((ex, idx) => {
                const isChecked = currentValue.includes(ex.ru);
                const displayText = language === "en" ? ex.en : ex.ru;
                return (
                  <div
                    key={idx}
                    onClick={() => handleCheckboxChange(paramKey, ex.ru)}
                    className="px-3 py-2.5 hover:bg-[#14161b] cursor-pointer transition-colors text-sm text-gray-300 flex items-center gap-2"
                  >
                    <div className={`rounded-full border-2 flex items-center justify-center transition-all ${
                      isChecked ? 'border-gray-500 bg-gray-600' : 'border-gray-600 bg-transparent'
                    }`} style={{ width: '15px', height: '15px', minWidth: '15px', minHeight: '15px' }}>
                      {isChecked && (
                        <div className="w-2.5 h-2.5 rounded-full bg-gray-200"></div>
                      )}
                    </div>
                    <span>{displayText}</span>
                  </div>
                );
              })}
              <div
                onClick={() => {
                  setCustomInputMode(prev => ({ ...prev, [paramKey]: true }));
                  setOpenDropdown(null);
                }}
                className="px-3 py-2.5 hover:bg-[#14161b] cursor-pointer transition-colors text-sm border-t border-gray-800 font-semibold text-gray-400 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {t.buttons.other}
              </div>
              </div>
            </div>
          )}

          {currentValue.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {currentValue.map((val, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-gray-700 text-gray-200 text-xs rounded"
                >
                  {val}
                  <button
                    onClick={() => handleCheckboxChange(paramKey, val)}
                    className="hover:text-red-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Для полей select (пол без "Другое...")
    if (inputType === "select") {
      return (
        <div className="relative custom-select">
          <label className="block text-xs font-semibold text-gray-400 mb-1.5">
            {getParamTranslation(paramKey)}
          </label>
          <div
            onClick={() => setOpenDropdown(isOpen ? null : paramKey)}
            className={inputStyles}
          >
            <span className={currentValue ? "text-gray-100" : "text-gray-500"}>
              {currentValue || placeholder || t.buttons.no}
            </span>
            <svg
              className="absolute right-3 top-[2.35rem] w-4 h-4 text-gray-500 pointer-events-none transition-transform"
              style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <polyline points="6 9 12 15 18 9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {isOpen && (
            <div
              ref={(el) => dropdownRefs.current[paramKey] = el}
              className="absolute z-50 w-full mt-1 bg-[#1a1d24] border border-gray-800 rounded-lg shadow-[0_0px_0px_rgba(0,0,0,0.2)] overflow-hidden"
              style={{ maxHeight: dropdownMaxHeight[paramKey] || '15rem' }}
            >
              <div className="custom-dropdown-scroll overflow-y-auto" style={{ marginRight: '2px', marginTop: '2px', marginBottom: '2px', maxHeight: `calc(${dropdownMaxHeight[paramKey] || '15rem'} - 4px)` }}>
              <div
                onClick={() => {
                  if (currentValue) {
                    handleChange(paramKey, "");
                    setOpenDropdown(null);
                  }
                }}
                className={`px-3 py-2.5 ${currentValue ? 'hover:bg-[#14161b] cursor-pointer text-red-400' : 'cursor-default text-gray-600'} transition-colors text-sm font-semibold border-b border-gray-800`}
              >
                {t.buttons.no}
              </div>
              {param.examples.map((ex, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    handleChange(paramKey, ex.ru);
                    setOpenDropdown(null);
                  }}
                  className={`px-3 py-2.5 hover:bg-[#14161b] cursor-pointer transition-colors text-sm ${
                    currentValue === ex.ru ? 'bg-[#14161b] font-semibold text-gray-100' : 'text-gray-300'
                  }`}
                >
                  {language === "en" ? ex.en : ex.ru}
                </div>
              ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    // Для полей manualWithColor (с опцией "Назначить цвет")
    if (inputType === "manualWithColor") {
      if (showBackgroundColorPicker) {
        const currentColors = values.BACKGROUND_COLORS || [];

        return (
          <div className="relative">
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">
              {getParamTranslation(paramKey)}
            </label>
            <div className="flex items-center gap-2">
              {[0, 1, 2].map((slotIndex) => (
                <div
                  key={slotIndex}
                  onClick={() => {
                    setColorPickerState({
                      isOpen: true,
                      slotIndex,
                      tempColor: currentColors[slotIndex] || "#000000",
                      paramKey: "BACKGROUND_COLORS"
                    });
                  }}
                  className="color-square w-12 border border-gray-800 rounded-lg focus:border-gray-600 transition-all outline-none bg-[#14161b] cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:border-gray-600"
                  style={{ backgroundColor: currentColors[slotIndex] || "transparent" }}
                  title={currentColors[slotIndex] || t.buttons.selectColor}
                ></div>
              ))}
              <button
                onClick={() => setShowBackgroundColorPicker(false)}
                className="text-xs text-gray-400 hover:text-gray-200 font-semibold ml-2"
              >
                {t.buttons.fromList}
              </button>
            </div>
          </div>
        );
      }

      if (isCustom) {
        return (
          <div className="relative custom-select">
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">
              {getParamTranslation(paramKey)}
            </label>
            <div className="relative">
              <input
                type="text"
                value={currentValue}
                onChange={(e) => handleChange(paramKey, e.target.value)}
                onBlur={() => {
                  if (!currentValue) {
                    setCustomInputMode(prev => ({ ...prev, [paramKey]: false }));
                  }
                }}
                placeholder={placeholder || t.placeholders.enterValue}
                className={customInputStyles}
                autoFocus
              />
              <button
                onClick={() => {
                  setCustomInputMode(prev => ({ ...prev, [paramKey]: false }));
                  setOpenDropdown(paramKey);
                }}
                className="absolute right-2 top-[0.8rem] text-xs text-gray-400 hover:text-gray-200 font-semibold"
              >
                {t.buttons.fromList}
              </button>
            </div>
          </div>
        );
      }

      return (
        <div className="relative custom-select">
          <label className="block text-xs font-semibold text-gray-400 mb-1.5">
            {getParamTranslation(paramKey)}
          </label>
          <div
            onClick={() => setOpenDropdown(isOpen ? null : paramKey)}
            className={inputStyles}
          >
            <span className={currentValue ? "text-gray-100" : "text-gray-500"}>
              {currentValue || placeholder || t.buttons.no}
            </span>
            <svg
              className="absolute right-3 top-[2.35rem] w-4 h-4 text-gray-500 pointer-events-none transition-transform"
              style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <polyline points="6 9 12 15 18 9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {isOpen && (
            <div
              ref={(el) => dropdownRefs.current[paramKey] = el}
              className="absolute z-50 w-full mt-1 bg-[#1a1d24] border border-gray-800 rounded-lg shadow-[0_0px_0px_rgba(0,0,0,0.2)] overflow-hidden"
              style={{ maxHeight: dropdownMaxHeight[paramKey] || '15rem' }}
            >
              <div className="custom-dropdown-scroll overflow-y-auto" style={{ marginRight: '2px', marginTop: '2px', marginBottom: '2px', maxHeight: `calc(${dropdownMaxHeight[paramKey] || '15rem'} - 4px)` }}>
              <div
                onClick={() => {
                  if (currentValue) {
                    handleChange(paramKey, "");
                    setOpenDropdown(null);
                  }
                }}
                className={`px-3 py-2.5 ${currentValue ? 'hover:bg-[#14161b] cursor-pointer text-red-400' : 'cursor-default text-gray-600'} transition-colors text-sm font-semibold border-b border-gray-800`}
              >
                {t.buttons.no}
              </div>
              {param.examples.map((ex, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    handleChange(paramKey, ex.ru);
                    setOpenDropdown(null);
                    setCustomInputMode(prev => ({ ...prev, [paramKey]: false }));
                  }}
                  className={`px-3 py-2.5 hover:bg-[#14161b] cursor-pointer transition-colors text-sm ${
                    currentValue === ex.ru ? 'bg-[#14161b] font-semibold text-gray-100' : 'text-gray-300'
                  }`}
                >
                  {language === "en" ? ex.en : ex.ru}
                </div>
              ))}
              <div
                onClick={() => {
                  setShowBackgroundColorPicker(true);
                  setOpenDropdown(null);
                }}
                className="px-3 py-2.5 hover:bg-[#14161b] cursor-pointer transition-colors text-sm border-t border-gray-800 font-semibold text-gray-400 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                {t.buttons.assignColor}
              </div>
              <div
                onClick={() => {
                  setCustomInputMode(prev => ({ ...prev, [paramKey]: true }));
                  setOpenDropdown(null);
                }}
                className="px-3 py-2.5 hover:bg-[#14161b] cursor-pointer transition-colors text-sm border-t border-gray-800 font-semibold text-gray-400 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {t.buttons.other}
              </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Для полей manual (все остальные с "Другое...")
    return (
      <div className="relative custom-select">
        <label className={`block text-xs font-semibold mb-1.5 ${isDisabled ? 'text-gray-600' : 'text-gray-400'}`}>
          {getParamTranslation(paramKey)}
        </label>

        {isCustom ? (
          <div className="relative">
            <input
              type="text"
              value={currentValue}
              onChange={(e) => !isDisabled && handleChange(paramKey, e.target.value)}
              onBlur={() => {
                if (!currentValue) {
                  setCustomInputMode(prev => ({ ...prev, [paramKey]: false }));
                }
              }}
              placeholder={placeholder || t.placeholders.enterValue}
              className={customInputStyles}
              autoFocus
              disabled={isDisabled}
            />
            <button
              onClick={() => {
                setCustomInputMode(prev => ({ ...prev, [paramKey]: false }));
                setOpenDropdown(paramKey);
              }}
              className="absolute right-2 top-[0.9rem] text-xs text-gray-400 hover:text-gray-200 font-semibold"
            >
              Из списка
            </button>
          </div>
        ) : (
          <>
            <div
              onClick={() => !isDisabled && setOpenDropdown(isOpen ? null : paramKey)}
              className={`${inputStyles} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className={currentValue ? "text-gray-100" : "text-gray-500"}>
                {currentValue || placeholder || t.buttons.no}
              </span>
              <svg
                className="absolute right-3 top-[2.35rem] w-4 h-4 text-gray-500 pointer-events-none transition-transform"
                style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <polyline points="6 9 12 15 18 9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {isOpen && (
              <div
                ref={(el) => dropdownRefs.current[paramKey] = el}
                className="absolute z-50 w-full mt-1 bg-[#1a1d24] border border-gray-800 rounded-lg shadow-[0_0px_0px_rgba(0,0,0,0.2)] overflow-hidden"
                style={{ maxHeight: dropdownMaxHeight[paramKey] || '15rem' }}
              >
                <div className="custom-dropdown-scroll overflow-y-auto" style={{ marginRight: '2px', marginTop: '2px', marginBottom: '2px', maxHeight: `calc(${dropdownMaxHeight[paramKey] || '15rem'} - 4px)` }}>
                <div
                  onClick={() => {
                    if (currentValue) {
                      handleChange(paramKey, "");
                      setOpenDropdown(null);
                    }
                  }}
                  className={`px-3 py-2.5 ${currentValue ? 'hover:bg-[#14161b] cursor-pointer text-red-400' : 'cursor-default text-gray-600'} transition-colors text-sm font-semibold border-b border-gray-800`}
                >
                  {t.buttons.no}
                </div>
                {param.examples.map((ex, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      handleChange(paramKey, ex.ru);
                      setOpenDropdown(null);
                      setCustomInputMode(prev => ({ ...prev, [paramKey]: false }));
                    }}
                    className={`px-3 py-2.5 hover:bg-[#14161b] cursor-pointer transition-colors text-sm ${
                      currentValue === ex.ru ? 'bg-[#14161b] font-semibold text-gray-100' : 'text-gray-300'
                    }`}
                  >
                    {language === "en" ? ex.en : ex.ru}
                  </div>
                ))}
                <div
                  onClick={() => {
                    setCustomInputMode(prev => ({ ...prev, [paramKey]: true }));
                    setOpenDropdown(null);
                  }}
                  className="px-3 py-2.5 hover:bg-[#14161b] cursor-pointer transition-colors text-sm border-t border-gray-800 font-semibold text-gray-400 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {t.buttons.other}
                </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const getStepClasses = (isActive = false) => {
    return isActive
      ? 'bg-gray-700 border border-gray-600'
      : 'bg-gray-800 hover:bg-gray-750 border border-gray-700';
  };

  const getStepStyle = (isActive = false) => {
    return { color: '#ffaa00' };
  };

  return (
    <div className="min-h-screen bg-[#0f1115]">
      <div className="max-w-7xl mx-auto pt-4 px-2 md:px-0">
        {/* Баннер с изображениями */}
        <div className="mb-2 overflow-hidden rounded-xl relative" style={{ height: window.innerWidth < 768 ? '160px' : '200px' }}>
          <img
            src="/photo.webp"
            alt="Photo examples"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center">
            <div className="absolute top-3 right-3 flex gap-2">
              <button
                onClick={() => setLanguage(language === "ru" ? "en" : "ru")}
                className="p-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-all flex items-center gap-2 hover:text-gray-100 text-sm"
                style={{ color: '#ffaa00' }}
                title={language === "ru" ? "Switch to English" : "Переключить на русский"}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                <span className="hidden md:inline font-semibold">{language === "ru" ? "EN" : "RU"}</span>
              </button>
              <button
                onClick={() => setShowHelpModal(true)}
                className="p-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-all flex items-center gap-2 hover:text-gray-100 text-sm"
                style={{ color: '#ffaa00' }}
                title={translations[language].header.help}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="hidden md:inline">{translations[language].header.help}</span>
              </button>
            </div>
            <div className="text-center">
              <h1 className="font-bold text-gray-100 flex items-center justify-center gap-2 md:gap-4" style={{ fontSize: window.innerWidth < 768 ? '1.3rem' : '3rem', lineHeight: window.innerWidth < 768 ? '1.3rem' : '3rem' }}>
                <div className="flex flex-col items-end">
                  <span>{t.header.title}</span>
                  <span style={{ fontSize: window.innerWidth < 768 ? '0.9rem' : '2rem', lineHeight: window.innerWidth < 768 ? '1.3rem' : '3rem' }}>{t.header.subtitle}</span>
                </div>
                <img
                  src="/nano-banana.svg"
                  alt="Nano Banana Logo"
                  className="w-[45px] h-[45px] md:w-[90px] md:h-[90px]"
                  style={{ filter: 'brightness(0) saturate(100%) invert(62%) sepia(98%) saturate(1679%) hue-rotate(0deg) brightness(105%) contrast(106%)' }}
                />
                <span style={{ color: '#ffaa00', fontSize: window.innerWidth < 768 ? '1.3rem' : '3rem' }}>{t.header.appName}</span>
              </h1>
            </div>
          </div>
        </div>

        {/* Навигация по шагам */}
        <div className="mb-5 bg-[#1a1d24] border border-gray-800 rounded-xl p-2 shadow-[0_0px_0px_rgba(0,0,0,0.12)]">
          <div className="grid grid-cols-4 md:flex md:items-center md:justify-between gap-2">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex items-center md:flex-1">
                <button
                  onClick={() => setCurrentStep(idx)}
                  className={`flex items-center gap-2 px-[0.875rem] py-[0.55rem] rounded-lg font-medium transition-all text-sm w-full justify-center ${
                    getStepClasses(currentStep === idx)
                  }`}
                  style={getStepStyle(currentStep === idx)}
                >
                  {icons[step.icon]}
                  <span className="hidden lg:inline">{step.name}</span>
                </button>
                {idx < steps.length - 1 && (
                  <div className="hidden md:block w-0 h-px bg-gray-800 mx-1"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5">
          {/* Панель с текущим шагом */}
          <div className="bg-[#1a1d24] border border-gray-800 rounded-xl p-2 shadow-[0_0px_0px_rgba(0,0,0,0.12)]">
            <div className="bg-[#14161b] p-4 rounded-xl border border-gray-800 shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
              <div className="flex items-center gap-3 mb-4">
                <div style={{ width: '48px', height: '48px', color: '#ffaa00' }}>
                  {iconLarge[currentStepData.icon]}
                </div>
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: '#ffaa00' }}>
                    {currentStepData.name}
                  </h2>
                  <p className="text-sm text-gray-500">Шаг {currentStep + 1} из {steps.length}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {currentStepData.fields.map(field => (
                  <div key={field}>
                    {renderInput(field)}
                  </div>
                ))}
              </div>
            </div>

            {/* Навигационные кнопки */}
            <div className="flex items-center mt-4 gap-4">
              {!isFirstStep ? (
                <button
                  onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                  className="flex items-center gap-2 px-[0.875rem] py-[0.55rem] bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-600 rounded-lg font-medium transition-all text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Назад
                </button>
              ) : (
                <div style={{ width: '86px' }}></div>
              )}

              <div className="flex-1 text-center text-sm text-gray-500 font-medium">
                {currentStep + 1} / {steps.length}
              </div>

              {!isLastStep ? (
                <button
                  onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
                  className="flex items-center gap-2 px-[0.875rem] py-[0.55rem] bg-gray-700 text-gray-100 border border-gray-600 rounded-lg font-medium text-sm hover:bg-gray-600 transition-all"
                >
                  Далее
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <div style={{ width: '86px' }}></div>
              )}
            </div>
          </div>
        </div>

        {/* Кнопки "Очистить все параметры" и "Показать JSON-промпт" */}
        <div className="mb-4 bg-[#1a1d24] border border-gray-800 rounded-xl p-2 shadow-[0_0px_0px_rgba(0,0,0,0.12)]">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setValues({
                  GENDER: "",
                  AGE: "",
                  WEIGHT_KG: "",
                  BODY_TYPE: "",
                  MODEL_ANGLE: [],
                  POSE: "",
                  PHOTO_STYLE: [],
                  FAMOUS_PHOTOGRAPHER_STYLE: "",
                  LIGHTING_SETUP: [],
                  CAMERA_ANGLE: "",
                  FOCAL_LENGTH: "",
                  DEPTH_OF_FIELD: "",
                  OUTFIT_STYLE: "",
                  COLOR_PALETTE: [],
                  HEADWEAR: "",
                  TOP: [],
                  BOTTOM: "",
                  FOOTWEAR: "",
                  ACCESSORIES: [],
                  LOCATION_TYPE: "",
                  COUNTRY: "",
                  SEASON: "",
                  TIME_OF_DAY: "",
                  WEATHER: "",
                  BACKGROUND_TYPE: "",
                  BACKGROUND_COLORS: [],
                  "MOOD/ATMOSPHERE": [],
                  POST_PROCESSING: []
                });
                setCustomInputMode({});
                setCurrentStep(0);
              }}
              className="py-3 rounded-lg font-semibold text-sm transition-all bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-600"
              style={{ width: window.innerWidth < 768 ? '35%' : '16.67%' }}
            >
              {t.buttons.clearAll}
            </button>
            <button
              onClick={() => setShowPromptModal(true)}
              disabled={!prompt}
              className={`py-3 rounded-lg font-semibold text-sm transition-all ${
                prompt
                  ? 'hover:opacity-90 border'
                  : 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700'
              }`}
              style={prompt ? { backgroundColor: '#ffaa00', borderColor: '#ffaa00', color: '#0f1115', width: window.innerWidth < 768 ? '65%' : '83.33%' } : { width: window.innerWidth < 768 ? '65%' : '83.33%' }}
            >
              {t.buttons.showPrompt}
            </button>
          </div>
        </div>

        {/* Блок с донатом */}
        <div className="mb-2 bg-[#1a1d24] border border-gray-800 rounded-xl p-4 shadow-[0_0px_0px_rgba(0,0,0,0.12)]">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => {
                if (language === 'ru') {
                  setShowDonateModal(true);
                } else {
                  window.open('https://ko-fi.com/G2G71MAQKX', '_blank');
                }
              }}
              className="px-6 py-2.5 rounded-lg font-semibold text-sm transition-all hover:opacity-90 border whitespace-nowrap"
              style={{ backgroundColor: '#ffaa00', borderColor: '#ffaa00', color: '#0f1115' }}
            >
              {t.buttons.donate}
            </button>
            <p className="text-gray-300 text-sm" dangerouslySetInnerHTML={{ __html: t.donation.text }}></p>
          </div>
        </div>
      </div>

      {/* Глобальное модальное окно для выбора цвета */}
      {colorPickerState.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closeColorPicker}>
          <div className="bg-[#1a1d24] border border-gray-800 rounded-xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.3)]" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-100 mb-4">{t.buttons.selectColor}</h3>
            <div className="flex flex-col gap-4">
              <HexColorPicker
                color={colorPickerState.tempColor}
                onChange={(color) => setColorPickerState(prev => ({ ...prev, tempColor: color }))}
                style={{ width: '256px', height: '160px' }}
              />
              <input
                type="text"
                value={colorPickerState.tempColor}
                onChange={(e) => setColorPickerState(prev => ({ ...prev, tempColor: e.target.value }))}
                className="w-full px-3 py-2 bg-[#14161b] border border-gray-700 rounded text-gray-100 text-sm"
                placeholder={t.placeholders.colorPlaceholder}
              />
              <div className="flex gap-2 justify-center">
                <button
                  onClick={closeColorPicker}
                  className="px-4 py-2 bg-gray-700 text-gray-200 rounded-lg text-sm hover:bg-gray-600 transition-all"
                >
                  {t.buttons.cancel}
                </button>
                <button
                  onClick={() => applyColor()}
                  className="px-4 py-2 bg-gray-600 text-gray-100 rounded-lg text-sm hover:bg-gray-500 transition-all"
                >
                  {t.buttons.select}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно для JSON-промпта */}
      {showPromptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowPromptModal(false)}>
          <div className="bg-[#1a1d24] border border-gray-800 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.3)] max-w-3xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="custom-dropdown-scroll modal-scroll overflow-y-auto px-6 py-6" style={{ marginRight: '4px', marginTop: '4px', marginBottom: '4px', maxHeight: 'calc(80vh - 8px)' }}>
              <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-100">{t.modal.promptTitle}</h3>
              <button
                onClick={() => setShowPromptModal(false)}
                className="text-gray-400 hover:text-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <pre className="whitespace-pre-wrap text-xs text-gray-300 bg-[#0f1115] p-4 rounded-lg leading-relaxed border border-gray-800 font-mono shadow-[inset_0_2px_8px_rgba(0,0,0,0.15)] mb-4">{prompt}</pre>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setShowPromptModal(false)}
                className="px-6 py-3 bg-gray-700 text-gray-200 rounded-lg text-sm hover:bg-gray-600 transition-all"
                style={{ width: '150px' }}
              >
                {t.buttons.close}
              </button>
              <button
                onClick={handleCopyPrompt}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all text-sm hover:opacity-90"
                style={copied ? { backgroundColor: '#b85c00', color: '#fff', width: '150px' } : { backgroundColor: '#ffaa00', color: '#0f1115', width: '150px' }}
              >
                {copied ? (
                  <>
                    <svg width="24" height="24" style={{ minWidth: '24px', minHeight: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t.buttons.copied}
                  </>
                ) : (
                  <>
                    <svg width="24" height="24" style={{ minWidth: '24px', minHeight: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    {t.buttons.copy}
                  </>
                )}
              </button>
            </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно помощи */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowHelpModal(false)}>
          <div className="bg-[#1a1d24] border border-gray-800 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.3)] max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Фиксированный заголовок */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#1a1d24] border-b border-gray-800">
              <h3 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t.modal.helpTitle}
              </h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-gray-400 hover:text-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Прокручиваемый контент */}
            <div className="custom-dropdown-scroll modal-scroll overflow-y-auto flex-1 px-6 py-6" style={{ marginRight: '4px', marginTop: '2px', marginBottom: '2px' }}>
              <div className="text-gray-300 space-y-4 text-sm leading-relaxed">
                <div>
                  <h4 className="text-lg font-semibold text-gray-100 mb-2">{t.modal.aboutApp}</h4>
                  <p dangerouslySetInnerHTML={{ __html: t.modal.aboutAppText }} />
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-100 mb-2">{t.modal.howToUse}</h4>
                  <ol className="list-decimal list-inside space-y-2 ml-2">
                    {t.modal.howToUseSteps.map((step, idx) => (
                      <li key={idx} dangerouslySetInnerHTML={{ __html: step }} />
                    ))}
                  </ol>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-100 mb-2">{t.modal.categories}</h4>
                  <ul className="space-y-1 ml-2">
                    {t.modal.categoriesList.map((category, idx) => (
                      <li key={idx} dangerouslySetInnerHTML={{ __html: category }} />
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-100 mb-2">{t.modal.tips}</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    {t.modal.tipsList.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Фиксированная кнопка */}
            <div className="flex justify-center px-6 py-4 bg-[#1a1d24] border-t border-gray-800">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-6 py-2 rounded-lg font-semibold transition-all text-sm hover:opacity-90"
                style={{ backgroundColor: '#ffaa00', color: '#0f1115' }}
              >
                {t.buttons.understand}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно с донатом */}
      {showDonateModal && language === 'ru' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowDonateModal(false)}>
          <div className="bg-[#1a1d24] border border-gray-800 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.3)] overflow-hidden" style={{ width: '528px', height: '296px', maxWidth: 'calc(100% - 32px)' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 bg-[#1a1d24] border-b border-gray-800">
              <h3 className="text-xl font-semibold text-gray-100">{t.donation.modalTitle}</h3>
              <button
                onClick={() => setShowDonateModal(false)}
                className="text-gray-400 hover:text-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div style={{ padding: 0, margin: 0 }}>
              <iframe
                src="https://widget.donatepay.ru/widgets/page/07a9a96b8ed0b637ff25d29fae0a81a3950716ba903a22b4ef25ef36889a0057?widget_id=7066804&sum=300"
                width="518"
                height="292"
                frameBorder="0"
                scrolling="no"
                style={{ display: 'block', border: 'none', overflow: 'hidden', margin: 0, padding: 0 }}
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
