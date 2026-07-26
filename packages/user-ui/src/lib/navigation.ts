export function replaceLocaleInPath(pathname: string, locale: string) {
  return pathname.replace(/^\/(es|en)/, `/${locale}`)
}
