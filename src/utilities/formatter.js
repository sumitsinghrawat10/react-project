export const nameFormatter = (name) =>
  name.toLowerCase().replace(/\b(\w)/g, (s) => s.toUpperCase());

export const contactPhoneFormatter = (phoneContact) =>
  phoneContact.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");

export const roleFormatter = (string) =>
string === null ? "" : string.replace(/([A-Z])/g, " $1").replace("of ", " of ").replace("Reg Tech", "RegTech").trim();
