
export const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // The result includes the data URL prefix (e.g., "data:image/jpeg;base64,"),
        // so we need to remove it.
        resolve(reader.result.split(',')[1]);
      } else {
        // Handle ArrayBuffer case if necessary, though for images it's usually a data URL
        resolve(''); // Or handle error appropriately
      }
    };
    reader.readAsDataURL(file);
  });

  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type,
    },
  };
};

export const base64ToFile = async (base64String: string, fileName: string): Promise<File> => {
    const res = await fetch(base64String);
    const blob = await res.blob();
    return new File([blob], fileName, { type: blob.type });
};
