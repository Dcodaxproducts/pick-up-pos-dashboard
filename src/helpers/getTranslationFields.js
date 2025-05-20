export default function getTranslationFields(
  languages,
  values,
  field = 'title',
) {
  const result = {};
  languages?.forEach((item) => {
    const locale = item?.locale;
    const fieldValue = values?.[field]?.[locale];
    if (fieldValue !== undefined) {
      result[locale] = fieldValue;
    }
  });
  return result;
}
