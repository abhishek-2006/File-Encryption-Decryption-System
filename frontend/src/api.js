const API_BASE_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000' : window.location.origin);

export const processFile = async (file, password, mode) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('password', password);

  const response = await fetch(`${API_BASE_URL}/${mode}`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    let errorMsg = `Server error: ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData && errorData.detail) {
        errorMsg = errorData.detail;
      }
    } catch (e) {
      // Ignored if response is not valid JSON
    }
    throw new Error(errorMsg);
  }

  return await response.blob();
};