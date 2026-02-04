export const tattoos = Array.from({ length: 21 }, (_, i) => ({
  id: i + 1,
  src: `/tattoos/${i + 1}.jpeg`,
  alt: `Trabajo de tatuaje ${i + 1} por J3R3F3`,
}));
