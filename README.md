# 📱 ReadScribe — React Native (Expo)

O‘zbek tilli o‘rganuvchilar uchun ingliz tili mutolaa, so‘z yodlash va insho yozish ilovasi. 

Loyiha Android Studio va og‘ir emulyator talab qilmaydi. **Expo Go** orqali to‘g‘ridan-to‘g‘ri telefoningizda (QR kodni skanerlab) yoki kompyuter brauzerida ishga tushirishingiz mumkin! 🚀

---

## ⚡ Qanday ishga tushirish kerak?

### 1. Terminalda loyiha papkasiga o'ting va Expo'ni boshlang:
```bash
npx expo start
```
yoki:
```bash
npm start
```

### 2. Telefonda ko'rish (Expo Go):
1. Telefoningizga **Expo Go** ilovasini o'rnating:
   - [Android uchun Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS uchun App Store](https://apps.apple.com/app/expo-go/id982107443)
2. Terminalda chiqqan **QR-kodni** telefoningiz kamerasi yoki Expo Go orqali skanerlang.
3. Ilova soniyalar ichida telefoningizda ochiladi!

### 3. Brauzerda ochish (Web):
Terminalda `w` tugmasini bosing yoki:
```bash
npm run web
```

---

## 🛠️ Tuzatilgan Xatolar va Yangiliklar (Changelog)

Oldingi Android (Kotlin/Jetpack Compose) loyihasidagi barcha kamchiliklar bartaraf etildi:

1. **⚡ Monster ViewModel (477 qator) parchalab tashlandi:**
   - Toza va modulli React Context arxitekturasi (`AppContext.tsx`).
   - Alohida xizmatlar qatlami: `StorageService`, `SpeechService`, `AiService`.
2. **🔄 Qattiq kodlangan (Hardcoded) ma'lumotlar olib tashlandi:**
   - `Alice Johnson` o'rniga foydalanuvchi profilini erkin tahrirlash imkoniyati.
   - Soxta foizlar (`65%`, `45%`) o'rniga haqiqiy mutolaa vaqti, haqiqiy yodlangan so'zlar va qaydlar statistikasi ulandi.
3. **🤖 Gemini Model nomi to'g'rilandi:**
   - Mavjud bo'lmagan `gemini-3.5-flash` o'rniga rasmiy `gemini-1.5-flash` modeliga ulandi.
   - API kalit kiritilmaganda yoki internet uzilganda ilova qotib qolmasligi uchun aqlli **Offline AI Fallback** mexanizmi yaratildi.
4. **🔊 Talaffuz (TTS) integratsiyasi:**
   - Har bir so'z, matn va tahlil qilingan gap uchun audio talaffuz ovozi qo'shildi.
5. **🎴 Flashcard rejimi qo'shildi:**
   - Lug'at bo'limida yangi so'zlarni kartochkalarni bosib o'girish (Flip Card) orqali yodlash rejimi yaratildi.
6. **✍️ Real-time So'z Hisoblagich:**
   - Yozish va insholar bo'limida har bir so'z soni avtomatik hisoblab boriladi.
7. **🎨 To'liq Sozlanuvchan Mutolaa:**
   - Shrift o'lchami (14pt - 26pt), 4 xil rang mavzusi (Light, Sepia, Dark, Night) va har bir so'zni bitta bosish orqali tarjima qilish.
# Language-learn-app
# Language-learn-app
