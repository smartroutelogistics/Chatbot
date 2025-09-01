const express = require('express');
const router = express.Router();
const translationService = require('../services/translationService');

// POST /api/translate - Translate text
router.post('/', async (req, res) => {
  try {
    const { text, targetLanguage, sourceLanguage } = req.body;

    // Validate input
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required for translation' });
    }

    if (!targetLanguage) {
      return res.status(400).json({ error: 'Target language is required' });
    }

    if (!translationService.isLanguageSupported(targetLanguage)) {
      return res.status(400).json({ 
        error: 'Unsupported target language',
        supportedLanguages: translationService.getSupportedLanguages()
      });
    }

    // Perform translation
    const translatedText = await translationService.translateText(
      text,
      targetLanguage,
      sourceLanguage
    );

    res.json({
      originalText: text,
      translatedText,
      sourceLanguage: sourceLanguage || 'auto',
      targetLanguage,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({
      error: 'Translation failed',
      message: error.message
    });
  }
});

// POST /api/translate/bulk - Translate multiple texts
router.post('/bulk', async (req, res) => {
  try {
    const { texts, targetLanguage, sourceLanguage } = req.body;

    // Validate input
    if (!Array.isArray(texts) || texts.length === 0) {
      return res.status(400).json({ error: 'Texts array is required' });
    }

    if (texts.length > 100) {
      return res.status(400).json({ error: 'Maximum 100 texts allowed per request' });
    }

    if (!targetLanguage) {
      return res.status(400).json({ error: 'Target language is required' });
    }

    if (!translationService.isLanguageSupported(targetLanguage)) {
      return res.status(400).json({ 
        error: 'Unsupported target language',
        supportedLanguages: translationService.getSupportedLanguages()
      });
    }

    // Perform bulk translation
    const translations = await translationService.translateBulk(
      texts,
      targetLanguage,
      sourceLanguage
    );

    res.json({
      originalTexts: texts,
      translations,
      sourceLanguage: sourceLanguage || 'auto',
      targetLanguage,
      count: translations.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Bulk translation error:', error);
    res.status(500).json({
      error: 'Bulk translation failed',
      message: error.message
    });
  }
});

// POST /api/translate/detect-language - Detect language of text
router.post('/detect-language', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required for language detection' });
    }

    const detectedLanguage = await translationService.detectLanguage(text);

    res.json({
      text,
      language: detectedLanguage,
      languageName: translationService.getLanguageName(detectedLanguage, 'en'),
      confidence: detectedLanguage !== 'en' ? 0.8 : 0.9, // Simplified confidence
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Language detection error:', error);
    res.status(500).json({
      error: 'Language detection failed',
      message: error.message
    });
  }
});

// GET /api/translate/languages - Get supported languages
router.get('/languages', (req, res) => {
  try {
    const inLanguage = req.query.in || 'en';
    const supportedLanguages = translationService.getSupportedLanguages();
    
    const languageList = supportedLanguages.map(code => ({
      code,
      name: translationService.getLanguageName(code, inLanguage),
      nativeName: translationService.getLanguageName(code, code)
    }));

    res.json({
      languages: languageList,
      count: languageList.length
    });

  } catch (error) {
    console.error('Error fetching supported languages:', error);
    res.status(500).json({
      error: 'Failed to fetch supported languages'
    });
  }
});

// GET /api/translate/greeting/:language - Get greeting in specific language
router.get('/greeting/:language', (req, res) => {
  try {
    const { language } = req.params;

    if (!translationService.isLanguageSupported(language)) {
      return res.status(400).json({
        error: 'Unsupported language',
        supportedLanguages: translationService.getSupportedLanguages()
      });
    }

    const greeting = translationService.getGreeting(language);
    const quickReplies = translationService.getQuickReplies(language);

    res.json({
      greeting,
      quickReplies,
      language,
      languageName: translationService.getLanguageName(language, language)
    });

  } catch (error) {
    console.error('Error fetching greeting:', error);
    res.status(500).json({
      error: 'Failed to fetch greeting'
    });
  }
});

// POST /api/translate/add-custom - Add custom translation (for admin use)
router.post('/add-custom', async (req, res) => {
  try {
    const { englishText, translations } = req.body;

    // Validate admin access (you should implement proper authentication)
    const adminKey = req.headers['x-admin-key'];
    if (adminKey !== process.env.ADMIN_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!englishText || !translations || typeof translations !== 'object') {
      return res.status(400).json({ 
        error: 'English text and translations object are required' 
      });
    }

    // Add the custom translation
    translationService.addCustomTranslation(englishText, translations);

    res.json({
      message: 'Custom translation added successfully',
      englishText,
      translations
    });

  } catch (error) {
    console.error('Error adding custom translation:', error);
    res.status(500).json({
      error: 'Failed to add custom translation'
    });
  }
});

module.exports = router;