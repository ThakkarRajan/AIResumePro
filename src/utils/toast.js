import toast from "react-hot-toast";

// Toast configuration
const defaultConfig = {
  duration: 4000,
  style: {
    background: '#363636',
    color: '#fff',
    borderRadius: '12px',
  },
};

// Toast positions
const positions = {
  topCenter: "top-center",
  topRight: "top-right",
  bottomCenter: "bottom-center",
};

// Toast types with predefined styles
const toastTypes = {
  success: {
    style: {
      background: '#10b981',
      color: '#fff',
      fontSize: '14px',
    },
  },
  error: {
    style: {
      background: '#ef4444',
      color: '#fff',
      fontSize: '14px',
    },
  },
  loading: {
    style: {
      background: '#3b82f6',
      color: '#fff',
      fontSize: '14px',
    },
  },
  warning: {
    style: {
      background: '#f59e0b',
      color: '#fff',
      fontSize: '14px',
    },
  },
  info: {
    style: {
      background: '#6366f1',
      color: '#fff',
      fontSize: '14px',
    },
  },
};

// Success toast
export const showSuccess = (message, options = {}) => {
  return toast.success(message, {
    ...defaultConfig,
    ...toastTypes.success,
    position: positions.topCenter,
    ...options,
  });
};

// Error toast
export const showError = (message, options = {}) => {
  return toast.error(message, {
    ...defaultConfig,
    ...toastTypes.error,
    position: positions.topCenter,
    ...options,
  });
};

// Loading toast
export const showLoading = (message, options = {}) => {
  return toast.loading(message, {
    ...toastTypes.loading,
    position: positions.topCenter,
    ...options,
  });
};

// Warning toast
export const showWarning = (message, options = {}) => {
  return toast(message, {
    ...defaultConfig,
    ...toastTypes.warning,
    position: positions.topCenter,
    ...options,
  });
};

// Info toast
export const showInfo = (message, options = {}) => {
  return toast(message, {
    ...defaultConfig,
    ...toastTypes.info,
    position: positions.topCenter,
    ...options,
  });
};

// Dismiss toast
export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};

// Dismiss all toasts
export const dismissAllToasts = () => {
  toast.dismiss();
};

// Custom toast with specific styling
export const showCustomToast = (message, style = {}, options = {}) => {
  return toast(message, {
    ...defaultConfig,
    style: {
      ...defaultConfig.style,
      ...style,
    },
    position: positions.topCenter,
    ...options,
  });
};

// Toast for highlight/certificate additions
export const showHighlightAdded = (isCertificate = false) => {
  const message = isCertificate ? "Certificate added!" : "Highlight added!";
  return showSuccess(message, {
    duration: 1500,
  });
};

// Toast for save operations
export const showSaveLoading = () => {
  return showLoading('Saving your resume...', {
    duration: 800,
  });
};

export const showSaveSuccess = () => {
  return showSuccess('Resume saved successfully!', {
    duration: 2000,
  });
};

export const showSaveError = () => {
  return showError('Failed to save. Please try again.', {
    duration: 3000,
  });
};

// Toast for download operations
export const showDownloadLoading = () => {
  return showLoading('Preparing your resume for download...', {
    duration: 1000,
  });
};

export const showDownloadSuccess = () => {
  return showSuccess('Redirecting to download page...', {
    duration: 2000,
  });
};

export const showDownloadError = () => {
  return showError('Something went wrong. Please try again.', {
    duration: 3000,
  });
};

// Toast for file operations
export const showFileUploadSuccess = () => {
  return showSuccess('File uploaded successfully!', {
    duration: 2000,
  });
};

export const showFileUploadError = (message = 'File upload failed. Please try again.') => {
  return showError(message, {
    duration: 3000,
  });
};

export const showFileDeleteSuccess = () => {
  return showSuccess('Resume deleted successfully!', {
    duration: 2000,
  });
};

export const showFileDeleteError = () => {
  return showError('Failed to delete file.', {
    duration: 3000,
  });
};

// Toast for form validation
export const showValidationError = (message) => {
  return showError(message, {
    duration: 3000,
  });
};

// Toast for network issues
export const showNetworkError = () => {
  return showError('No internet connection. Please check your network and try again.', {
    duration: 4000,
  });
};

export const showNetworkRetry = () => {
  return showError('Please try again after 10 seconds.', {
    duration: 3000,
  });
};

// Toast for AI processing
export const showAIProcessingError = (retryCount = 0, maxRetries = 3) => {
  if (retryCount > 0) {
    return showError(`Please try again. (${retryCount}/${maxRetries})`, {
      duration: 2000,
    });
  }
  return showError('Please try again.', {
    duration: 3000,
  });
};

// Toast for form clearing
export const showFormCleared = () => {
  return showSuccess('Form cleared!', {
    duration: 2000,
  });
};

// Export default toast for backward compatibility
export default toast; 