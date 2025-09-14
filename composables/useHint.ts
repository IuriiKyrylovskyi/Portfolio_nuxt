import { useState } from '#app';

interface HintOptions {
  message: string;
  title?: string;
  src?: string;
  duration?: number; // in milliseconds, defaults to 5000 (5 seconds)
  customClass?: string;
  showCloseButton?: boolean;
}

interface HintState {
  isVisible: boolean;
  message: string;
  title?: string;
  src?: string;
  duration?: number;
  customClass?: string;
  showCloseButton?: boolean;
}

export const useHint = () => {
  const hintState = useState<HintState>('globalHintPopup', () => ({
    isVisible: false,
    message: '',
  }));

  const showHint = (options: HintOptions) => {
    // Update the global state with new hint details
    hintState.value = {
      isVisible: true,
      message: options.message,
      title: options.title,
      src: options.src,
      duration: options.duration || 5000,
      customClass: options.customClass,
      showCloseButton: options.showCloseButton || false,
    };
  };

  const hideHint = () => {
    hintState.value.isVisible = false;
  };

  return {
    showHint,
    hideHint,
  };
};
