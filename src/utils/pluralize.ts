const pluralRules = new Intl.PluralRules('uk-UA');

type PluralForms = {
  one: string;
  few: string;
  many: string;
};

export const pluralize = (count: number, forms: PluralForms): string => {
  const category = pluralRules.select(count);

  if (category === 'one' || category === 'few') {
    return forms[category];
  }

  return forms.many;
};

export const QUESTION_FORMS: PluralForms = {
  one: 'питання',
  few: 'питання',
  many: 'питань',
};
