export const genChar = (length: number) => {
  const charset = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let randomChars = '';
  for (let i = 0; i < length; i++) {
    randomChars += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return randomChars;
}