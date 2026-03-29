export const decodeImage = (bufferObj) => {
  if (!bufferObj || !bufferObj.data) return null;
  const uint8Array = new Uint8Array(bufferObj.data);
  return new TextDecoder().decode(uint8Array);
};

export const getAvatarBase64 = (avatar) => {
  if (!avatar || !avatar.data) return "/default-avatar.png";

  const binary = new Uint8Array(avatar.data).reduce(
    (acc, byte) => acc + String.fromCharCode(byte),
    "",
  );
  return `data:image/png;base64,${btoa(binary)}`;
};
