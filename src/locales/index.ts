import { SiteCopy } from '../types/siteCopy';
import enStrings from './en';
import edfStrings from './edf';
import edfFrStrings from './edf_fr';
import bmwStrings from './bmw';
import enTemplateStrings from './en_template';
import hedosophStrings from './hedosoph';

import nestleStrings from './nestle';
export type LanguageCode = 'en' | 'edf' | 'edf_fr' | 'bmw' | 'en_template' | 'hedosoph' | 'nestle';

export const languages: Record<LanguageCode, SiteCopy> = {en: enStrings,
  edf: edfStrings,
  edf_fr: edfFrStrings,
  bmw: bmwStrings,
  en_template: enTemplateStrings,
  hedosoph: hedosophStrings,
  nestle: nestleStrings,
};

export const defaultLang: LanguageCode = 'en'; 