export const toWhatsappLink = (value: string) => {
  const digits = value.replace(/\D/g, '');
  if (!digits) {
    return '';
  }
  return `https://wa.me/${digits}`;
};
