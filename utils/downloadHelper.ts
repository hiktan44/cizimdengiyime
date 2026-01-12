/**
 * Unified Download Utility
 * Ensures all downloads work consistently across the application
 */

/**
 * Downloads a file from a URL with proper blob handling
 * @param url - The URL of the file to download (can be data URI or HTTP URL)
 * @param filename - The desired filename for the download
 * @param fallbackExtension - Fallback extension if detection fails (default: 'png')
 */
export const downloadFile = async (
    url: string,
    filename: string,
    fallbackExtension: string = 'png'
): Promise<boolean> => {
    try {
        // Ensure filename has an extension
        if (!filename.includes('.')) {
            filename = `${filename}.${fallbackExtension}`;
        }

        let blob: Blob;

        // Handle data URIs differently from HTTP URLs
        if (url.startsWith('data:')) {
            // For data URIs, convert directly to blob
            const response = await fetch(url);
            blob = await response.blob();
        } else {
            // For HTTP URLs, fetch with proper error handling
            try {
                const response = await fetch(url, {
                    mode: 'cors',
                    credentials: 'omit',
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                blob = await response.blob();
            } catch (fetchError) {
                console.warn('Fetch failed, trying direct download:', fetchError);
                // Fallback to direct link method
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                return true;
            }
        }

        // Create blob URL and trigger download
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;

        // Ensure the link is in the document for Firefox
        document.body.appendChild(link);

        // Trigger download
        link.click();

        // Cleanup
        document.body.removeChild(link);

        // Revoke blob URL after a short delay to ensure download starts
        setTimeout(() => {
            URL.revokeObjectURL(blobUrl);
        }, 100);

        return true;
    } catch (error) {
        console.error('Download error:', error);

        // Last resort: try opening in new tab
        try {
            window.open(url, '_blank');
            return true;
        } catch (openError) {
            console.error('Failed to open URL:', openError);
            return false;
        }
    }
};

/**
 * Extracts file extension from URL or data URI
 * @param url - The URL to extract extension from
 * @returns The file extension (e.g., 'png', 'jpg', 'mp4')
 */
export const getFileExtension = (url: string): string => {
    // Check for data URI mime type
    if (url.startsWith('data:')) {
        const mimeMatch = url.match(/^data:([^;]+);/);
        if (mimeMatch) {
            const mimeType = mimeMatch[1];
            const extensionMap: Record<string, string> = {
                'image/png': 'png',
                'image/jpeg': 'jpg',
                'image/jpg': 'jpg',
                'image/webp': 'webp',
                'image/gif': 'gif',
                'video/mp4': 'mp4',
                'video/webm': 'webm',
            };
            return extensionMap[mimeType] || 'png';
        }
    }

    // Extract from URL path
    const urlPath = url.split('?')[0]; // Remove query params
    const parts = urlPath.split('.');
    if (parts.length > 1) {
        const ext = parts[parts.length - 1].toLowerCase();
        // Validate it's a known extension
        if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'mp4', 'webm', 'svg'].includes(ext)) {
            return ext === 'jpeg' ? 'jpg' : ext;
        }
    }

    // Default fallback
    return 'png';
};

/**
 * Generates a safe filename with timestamp
 * @param prefix - Prefix for the filename
 * @param extension - File extension (without dot)
 * @returns A safe filename with timestamp
 */
export const generateFilename = (prefix: string, extension?: string): string => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const safePrefix = prefix.replace(/[^a-z0-9-_]/gi, '-').toLowerCase();

    if (extension) {
        return `${safePrefix}-${timestamp}.${extension}`;
    }

    return `${safePrefix}-${timestamp}`;
};
