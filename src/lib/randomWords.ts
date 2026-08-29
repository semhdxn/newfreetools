const adjectives = [
  'Blue', 'Red', 'Green', 'Golden', 'Silver', 'Purple', 'Orange', 'Bright',
  'Gentle', 'Swift', 'Happy', 'Calm', 'Brave', 'Clever', 'Kind', 'Warm',
  'Cool', 'Tall', 'Tiny', 'Wild', 'Soft', 'Bold', 'Fresh', 'Lucky',
  'Giant', 'Fuzzy', 'Shiny', 'Quiet', 'Sparkly', 'Misty', 'Sunny', 'Cosy',
];

const nouns = [
  'Banana', 'Tiger', 'Mountain', 'River', 'Dolphin', 'Rainbow', 'Cloud',
  'Star', 'Panda', 'Dragon', 'Forest', 'Ocean', 'Eagle', 'Meadow', 'Fox',
  'Castle', 'Crystal', 'Garden', 'Penguin', 'Sunset', 'Moon', 'Feather',
  'Butterfly', 'Acorn', 'Blossom', 'Breeze', 'Maple', 'Pebble', 'Coral',
  'Willow', 'Hawk', 'Otter',
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateUsername(): string {
  // Adjective + Noun keeps the share name friendly and memorable, but the
  // ~1000-pair pool collides often enough to break saves. Append a short
  // Crockford base32 suffix from 25 random bits (~33M values) so the
  // effective space is >30 billion and retries are effectively never needed.
  return randomFrom(adjectives) + randomFrom(nouns) + randomSuffix(5);
}

// Crockford base32 alphabet (no I, L, O, U) — unambiguous when read aloud
// or typed by a parent/teacher sharing the code.
const BASE32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

function randomSuffix(length: number): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = '';
  for (let i = 0; i < length; i++) out += BASE32[bytes[i] % 32];
  return out;
}

export function generatePassword(): string {
  return randomFrom(adjectives) + randomFrom(nouns) + randomFrom(nouns) + Math.floor(Math.random() * 10);
}

export function generateChildId(): string {
  const adj = randomFrom(adjectives).toLowerCase();
  const noun = randomFrom(nouns).toLowerCase();
  const num = Math.floor(Math.random() * 90) + 10; // 10-99
  return `${adj}-${noun}-${num}`;
}
