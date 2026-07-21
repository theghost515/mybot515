// bot/quranApi.js
// نجلب نص القرآن مباشرة من AlQuran Cloud API (رواية حفص - quran-uthmani)
// بدلاً من كتابة النص يدوياً، تفادياً لأي خطأ في كتاب الله عز وجل.
const BASE = 'https://api.alquran.cloud/v1';

async function getSurahList() {
  const res = await fetch(`${BASE}/surah`);
  if (!res.ok) throw new Error('تعذر جلب قائمة السور');
  const json = await res.json();
  return json.data; // [{number, name, englishName, numberOfAyahs, ...}]
}

async function getSurah(surahNumber) {
  const res = await fetch(`${BASE}/surah/${surahNumber}/quran-uthmani`);
  if (!res.ok) throw new Error('تعذر جلب السورة');
  const json = await res.json();
  return json.data; // {number, name, englishName, ayahs: [{numberInSurah, text}, ...]}
}

async function getAyah(surahNumber, ayahNumber) {
  const res = await fetch(`${BASE}/ayah/${surahNumber}:${ayahNumber}/quran-uthmani`);
  if (!res.ok) throw new Error('تعذر جلب الآية، تأكد من رقم السورة والآية');
  const json = await res.json();
  return json.data; // {text, numberInSurah, surah: {name, englishName, numberOfAyahs}}
}

async function getRandomAyah() {
  const surahs = await getSurahList();
  const surah = surahs[Math.floor(Math.random() * surahs.length)];
  const ayahNumber = Math.floor(Math.random() * surah.numberOfAyahs) + 1;
  return getAyah(surah.number, ayahNumber);
}

async function getRandomAyahInSurah(surahNumber) {
  const surah = await getSurah(surahNumber);
  const ayah = surah.ayahs[Math.floor(Math.random() * surah.ayahs.length)];
  return {
    text: ayah.text,
    numberInSurah: ayah.numberInSurah,
    surah: { name: surah.name, englishName: surah.englishName },
  };
}

module.exports = { getSurahList, getSurah, getAyah, getRandomAyah, getRandomAyahInSurah };
