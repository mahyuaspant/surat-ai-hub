// Utility functions for document hashing and verification

export async function generateHash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export async function generateDocumentHash(
  letterId: string,
  letterNumber: string,
  content: string,
  signedAt: string
): Promise<string> {
  const dataToHash = `${letterId}|${letterNumber}|${content}|${signedAt}`;
  return generateHash(dataToHash);
}

export async function generateSignatureHash(
  userId: string,
  letterId: string,
  signatureData: string,
  timestamp: string
): Promise<string> {
  const dataToHash = `${userId}|${letterId}|${signatureData}|${timestamp}`;
  return generateHash(dataToHash);
}

export function generateVerificationUrl(
  baseUrl: string,
  letterId: string,
  hash: string
): string {
  return `${baseUrl}/verify/${letterId}?hash=${hash}`;
}

export function validateHash(originalHash: string, compareHash: string): boolean {
  return originalHash === compareHash;
}
