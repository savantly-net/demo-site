// gets the localized field or the default field if the localized field is not available

import { SingleOrMultiple } from "./arrayHelpers";
import { defaultLocale } from "./localizationHelpers";

export function getLocalizedField(
  lang: string = defaultLocale,
  field: { [key: string]: string | undefined | null } | null | undefined
): string {
  if (!field) {
    return "MISSING FIELD";
  }
  console.log("field", field);
  return field[lang] || field[defaultLocale] || field["iv"] || "MISSING VALUE";
}

export const useLocalizedField = (lang?: string) => {
  return (
    field: { [key: string]: string | undefined | null } | null | undefined
  ) => getLocalizedField(lang, field);
};


export const getFirstImageUrl = (image: SingleOrMultiple<{ url: string }> | null | undefined): string => {
  if (Array.isArray(image)) {
    return image[0]?.url || "";
  }
  return image?.url || "";
}