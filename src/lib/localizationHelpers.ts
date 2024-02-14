import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";

export const supportedLocales = process.env.LOCALES_SUPPORTED?.split(",") || ["en"];
export const defaultLocale = process.env.LOCALES_DEFAULT || "en";

export const getLocale = (requestHeaders: Headers) => {
  const acceptLanguageHeader = requestHeaders.get("accept-language") || "";
  const headers = { "accept-language": acceptLanguageHeader };
  const languages = new Negotiator({ headers }).languages();

  return match(languages, supportedLocales, defaultLocale);
}
