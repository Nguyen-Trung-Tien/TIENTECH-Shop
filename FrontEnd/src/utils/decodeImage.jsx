export const getAvatarBase64 = (avatar) => {
  if (!avatar || !avatar.data) return "/default-avatar.png";

  const binary = new Uint8Array(avatar.data).reduce(
    (acc, byte) => acc + String.fromCharCode(byte),
    "",
  );
  return `data:image/png;base64,${btoa(binary)}`;
};
