/**
 * ReadScribe Initial Writing Notes
 */

import { WritingNote } from '../types';

export const INITIAL_NOTES: WritingNote[] = [
  {
    id: 'note-1',
    title: 'Mening kunlik taassurotlarim',
    category: 'Kundalik',
    content: `Bugun The Little Prince asarini o‘qishni boshladim. Antoine de Saint-Exupéryning oddiy, ammo chuqur falsafiy fikrlari menga juda yoqdi. 

Yangi o'rgangan so'zlar:
- magnificent: ajoyib, mahobatli
- boa constrictor: bo‘g‘ma ilon
- digestion: hazm qilish

Ertaga ikkinchi bobni o'qib, yana 5 ta yangi so'z yozib olaman.`,
    wordCount: 52,
    isPinned: true,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'note-2',
    title: 'Sun’iy intellekt haqida mulohaza',
    category: 'Insho',
    content: `Sun'iy intellekt insoniyat uchun xavfmi yoki ulkan imkoniyat? 

Menimcha, sun'iy intellekt inson o'rnini to'liq bosa olmaydi, balki insonning intellektual salohiyatini bir necha barobar oshiruvchi vosita bo'lib xizmat qiladi. Eng muhimi — doimiy o'rganish va moslashuvchanlikni saqlab qolish.`,
    wordCount: 39,
    isPinned: false,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
  },
];
