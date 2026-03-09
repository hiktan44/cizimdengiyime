/**
 * Cloudflare R2 Object Storage Service
 * S3-compatible API ile dosya yükleme
 */

const R2_ACCOUNT_ID = import.meta.env.VITE_R2_ACCOUNT_ID || '';
const R2_ACCESS_KEY_ID = import.meta.env.VITE_R2_ACCESS_KEY_ID || '';
const R2_SECRET_ACCESS_KEY = import.meta.env.VITE_R2_SECRET_ACCESS_KEY || '';
const R2_BUCKET_NAME = import.meta.env.VITE_R2_BUCKET_NAME || '';
const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL || '';

// R2 yapılandırılmış mı kontrol et
export const isR2Configured = (): boolean => {
    return !!(R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_BUCKET_NAME && R2_PUBLIC_URL);
};

/**
 * HMAC-SHA256 imzalama (Web Crypto API)
 */
const hmacSha256 = async (key: ArrayBuffer, message: string): Promise<ArrayBuffer> => {
    const cryptoKey = await crypto.subtle.importKey(
        'raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    return crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(message));
};

const sha256 = async (data: ArrayBuffer | string): Promise<string> => {
    const buffer = typeof data === 'string' ? new TextEncoder().encode(data) : data;
    const hash = await crypto.subtle.digest('SHA-256', buffer);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * AWS Signature V4 ile imzalanmış PUT isteği
 */
const signRequest = async (
    method: string,
    path: string,
    headers: Record<string, string>,
    payloadHash: string
): Promise<Record<string, string>> => {
    const now = new Date();
    const dateStamp = now.toISOString().replace(/[-:T]/g, '').slice(0, 8);
    const amzDate = now.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    const region = 'auto';
    const service = 's3';
    const scope = `${dateStamp}/${region}/${service}/aws4_request`;

    headers['x-amz-date'] = amzDate;
    headers['x-amz-content-sha256'] = payloadHash;

    // Canonical headers
    const signedHeaderKeys = Object.keys(headers).sort();
    const canonicalHeaders = signedHeaderKeys.map(k => `${k.toLowerCase()}:${headers[k]}`).join('\n') + '\n';
    const signedHeaders = signedHeaderKeys.map(k => k.toLowerCase()).join(';');

    // Canonical request
    const canonicalRequest = [method, path, '', canonicalHeaders, signedHeaders, payloadHash].join('\n');
    const canonicalRequestHash = await sha256(canonicalRequest);

    // String to sign
    const stringToSign = ['AWS4-HMAC-SHA256', amzDate, scope, canonicalRequestHash].join('\n');

    // Signing key
    const kDate = await hmacSha256(new TextEncoder().encode('AWS4' + R2_SECRET_ACCESS_KEY).buffer as ArrayBuffer, dateStamp);
    const kRegion = await hmacSha256(kDate, region);
    const kService = await hmacSha256(kRegion, service);
    const kSigning = await hmacSha256(kService, 'aws4_request');

    // Signature
    const signatureBuffer = await hmacSha256(kSigning, stringToSign);
    const signature = Array.from(new Uint8Array(signatureBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

    headers['Authorization'] = `AWS4-HMAC-SHA256 Credential=${R2_ACCESS_KEY_ID}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    return headers;
};

/**
 * Dosyayı Cloudflare R2'ye yükle
 * @returns Public URL veya null
 */
export const uploadToR2 = async (
    fileData: ArrayBuffer,
    fileName: string,
    contentType: string
): Promise<string | null> => {
    if (!isR2Configured()) {
        console.warn('⚠️ R2 yapılandırılmamış, upload atlanıyor');
        return null;
    }

    try {
        const endpoint = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
        const path = `/${R2_BUCKET_NAME}/${fileName}`;
        const payloadHash = await sha256(fileData);

        const headers: Record<string, string> = {
            'Host': `${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
            'Content-Type': contentType,
            'Content-Length': fileData.byteLength.toString(),
        };

        const signedHeaders = await signRequest('PUT', path, headers, payloadHash);

        const response = await fetch(`${endpoint}${path}`, {
            method: 'PUT',
            headers: signedHeaders,
            body: fileData,
        });

        if (!response.ok) {
            const text = await response.text();
            console.error('❌ R2 upload hatası:', response.status, text);
            return null;
        }

        const publicUrl = `${R2_PUBLIC_URL}/${fileName}`;
        console.log(`✅ R2 upload başarılı: ${publicUrl}`);
        return publicUrl;
    } catch (error) {
        console.error('❌ R2 upload exception:', error);
        return null;
    }
};

/**
 * Base64 string'i R2'ye yükle
 * @returns Public URL veya null
 */
export const uploadBase64ToR2 = async (
    base64Data: string,
    userId: string,
    type: 'input' | 'output' | 'video'
): Promise<string | null> => {
    if (!isR2Configured()) return null;

    try {
        // Base64 prefix'i temizle (data:image/png;base64, gibi)
        const base64Clean = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
        const binaryString = atob(base64Clean);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        // Content type belirle
        let contentType = 'image/png';
        let extension = 'png';
        if (base64Data.includes('data:image/jpeg') || base64Data.includes('data:image/jpg')) {
            contentType = 'image/jpeg';
            extension = 'jpg';
        } else if (base64Data.includes('data:image/webp')) {
            contentType = 'image/webp';
            extension = 'webp';
        } else if (base64Data.includes('data:video/mp4')) {
            contentType = 'video/mp4';
            extension = 'mp4';
        }

        const timestamp = Date.now();
        const fileName = `generations/${userId}/${type}_${timestamp}.${extension}`;

        return await uploadToR2(bytes.buffer as ArrayBuffer, fileName, contentType);
    } catch (error) {
        console.error('❌ Base64 → R2 upload hatası:', error);
        return null;
    }
};

/**
 * URL'den dosyayı indir ve R2'ye yükle
 * @returns Public URL veya null
 */
export const uploadUrlToR2 = async (
    sourceUrl: string,
    userId: string,
    type: 'input' | 'output' | 'video'
): Promise<string | null> => {
    if (!isR2Configured()) return null;

    try {
        const response = await fetch(sourceUrl);
        if (!response.ok) {
            console.error('❌ Kaynak URL indirilemedi:', response.status);
            return null;
        }

        const contentType = response.headers.get('content-type') || 'image/png';
        const buffer = await response.arrayBuffer();

        let extension = 'png';
        if (contentType.includes('jpeg') || contentType.includes('jpg')) extension = 'jpg';
        else if (contentType.includes('webp')) extension = 'webp';
        else if (contentType.includes('mp4')) extension = 'mp4';
        else if (contentType.includes('video')) extension = 'mp4';

        const timestamp = Date.now();
        const fileName = `generations/${userId}/${type}_${timestamp}.${extension}`;

        return await uploadToR2(buffer, fileName, contentType);
    } catch (error) {
        console.error('❌ URL → R2 upload hatası:', error);
        return null;
    }
};
