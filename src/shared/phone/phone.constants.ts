import { CountryCode } from "libphonenumber-js";

export const SUPPORTED_COUNTRIES = [
  "NG", // Nigeria
  "GH", // Ghana
  "NE", // Niger
  "CM", // Cameroon
  "TD", // Chad
  "BJ", // Benin
  "TG", // Togo
  "CI", // Côte d'Ivoire
  "SN", // Senegal
  "ML", // Mali
  "BF", // Burkina Faso
] as const satisfies readonly CountryCode[];
