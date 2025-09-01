const { Translate } = require('@google-cloud/translate').v2;

class TranslationService {
  constructor() {
    // Initialize Google Cloud Translate
    // You'll need to set GOOGLE_APPLICATION_CREDENTIALS environment variable
    // or provide credentials directly
    this.translate = process.env.GOOGLE_APPLICATION_CREDENTIALS 
      ? new Translate()
      : null;

    // Language codes mapping
    this.languageCodes = {
      'en': 'en',
      'es': 'es', 
      'ur': 'ur',
      'zh': 'zh'
    };

    // Fallback translations for common phrases (when Google Translate is not available)
    this.fallbackTranslations = {
      'Hello! How can I help you today?': {
        es: '¡Hola! ¿Cómo puedo ayudarte hoy?',
        ur: 'ہیلو! آج میں آپ کی کیسے مدد کر سکتا ہوں؟',
        zh: '你好！今天我能为您提供什么帮助？'
      },
      'Thank you for contacting SmartRoute Logistics!': {
        es: '¡Gracias por contactar a SmartRoute Logistics!',
        ur: 'SmartRoute Logistics سے رابطے کے لیے آپ کا شکریہ!',
        zh: '感谢您联系 SmartRoute Logistics！'
      },
      'I can help you with dispatching, factoring, and brokerage services.': {
        es: 'Puedo ayudarte con servicios de despacho, factoring y corretaje.',
        ur: 'میں آپ کو ڈسپیچنگ، فیکٹرنگ، اور بروکریج سروسز میں مدد کر سکتا ہوں۔',
        zh: '我可以帮助您处理调度、保理和经纪服务。'
      },
      'Would you like to speak with a live agent?': {
        es: '¿Te gustaría hablar con un agente en vivo?',
        ur: 'کیا آپ لائیو ایجنٹ سے بات کرنا چاہیں گے؟',
        zh: '您想与真人客服交谈吗？'
      },
      'I\'m sorry, I don\'t understand. Could you please rephrase?': {
        es: 'Lo siento, no entiendo. ¿Podrías reformular por favor?',
        ur: 'معذرت، میں نہیں سمجھا۔ کیا آپ دوبارہ بیان کر سکتے ہیں؟',
        zh: '抱歉，我不明白。您能重新表述一下吗？'
      }
    };
  }

  async detectLanguage(text) {
    try {
      if (this.translate) {
        const [detection] = await this.translate.detect(text);
        return Array.isArray(detection) ? detection[0].language : detection.language;
      } else {
        // Simple fallback language detection based on character patterns
        return this.detectLanguageFallback(text);
      }
    } catch (error) {
      console.error('Language detection error:', error);
      return 'en'; // Default to English
    }
  }

  async translateText(text, targetLanguage, sourceLanguage = null) {
    try {
      // Don't translate if target language is the same as source
      if (sourceLanguage && sourceLanguage === targetLanguage) {
        return text;
      }

      // Don't translate English to English
      if (targetLanguage === 'en' && !sourceLanguage) {
        const detectedLang = await this.detectLanguage(text);
        if (detectedLang === 'en') return text;
      }

      if (this.translate) {
        const [translation] = await this.translate.translate(text, {
          to: this.languageCodes[targetLanguage] || targetLanguage,
          from: sourceLanguage ? this.languageCodes[sourceLanguage] : undefined
        });
        return translation;
      } else {
        // Use fallback translations for common phrases
        return this.getFallbackTranslation(text, targetLanguage);
      }
    } catch (error) {
      console.error('Translation error:', error);
      return this.getFallbackTranslation(text, targetLanguage);
    }
  }

  detectLanguageFallback(text) {
    // Simple pattern-based language detection
    
    // Check for Chinese characters
    if (/[\u4e00-\u9fff]/.test(text)) {
      return 'zh';
    }
    
    // Check for Urdu characters
    if (/[\u0600-\u06ff]/.test(text)) {
      return 'ur';
    }
    
    // Check for Spanish words
    const spanishWords = [
      'hola', 'gracias', 'por favor', 'ayuda', 'necesito', 'quiero',
      'como', 'donde', 'cuando', 'que', 'porque', 'si', 'no'
    ];
    
    const lowerText = text.toLowerCase();
    const spanishMatches = spanishWords.filter(word => lowerText.includes(word)).length;
    
    if (spanishMatches >= 2) {
      return 'es';
    }
    
    // Default to English
    return 'en';
  }

  getFallbackTranslation(text, targetLanguage) {
    // First, check if we have a direct translation
    if (this.fallbackTranslations[text] && this.fallbackTranslations[text][targetLanguage]) {
      return this.fallbackTranslations[text][targetLanguage];
    }

    // Check for partial matches
    for (const [englishText, translations] of Object.entries(this.fallbackTranslations)) {
      if (text.includes(englishText) && translations[targetLanguage]) {
        return text.replace(englishText, translations[targetLanguage]);
      }
    }

    // If no translation found, return original text
    return text;
  }

  async translateBulk(texts, targetLanguage, sourceLanguage = null) {
    try {
      if (this.translate) {
        const [translations] = await this.translate.translate(texts, {
          to: this.languageCodes[targetLanguage] || targetLanguage,
          from: sourceLanguage ? this.languageCodes[sourceLanguage] : undefined
        });
        
        return Array.isArray(translations) ? translations : [translations];
      } else {
        return texts.map(text => this.getFallbackTranslation(text, targetLanguage));
      }
    } catch (error) {
      console.error('Bulk translation error:', error);
      return texts.map(text => this.getFallbackTranslation(text, targetLanguage));
    }
  }

  getSupportedLanguages() {
    return Object.keys(this.languageCodes);
  }

  isLanguageSupported(languageCode) {
    return this.getSupportedLanguages().includes(languageCode);
  }

  // Get language name in the target language
  getLanguageName(languageCode, inLanguage = 'en') {
    const languageNames = {
      en: {
        en: 'English',
        es: 'Spanish',
        ur: 'Urdu',
        zh: 'Chinese'
      },
      es: {
        en: 'Inglés',
        es: 'Español',
        ur: 'Urdu',
        zh: 'Chino'
      },
      ur: {
        en: 'انگریزی',
        es: 'ہسپانوی',
        ur: 'اردو',
        zh: 'چینی'
      },
      zh: {
        en: '英语',
        es: '西班牙语',
        ur: '乌尔都语',
        zh: '中文'
      }
    };

    return languageNames[inLanguage]?.[languageCode] || languageCode;
  }

  // Add common SmartRoute specific translations
  addCustomTranslation(englishText, translations) {
    this.fallbackTranslations[englishText] = translations;
  }

  // Get greeting in specific language
  getGreeting(language) {
    const greetings = {
      en: "👋 Welcome to SmartRoute Logistics! How can I assist you today?",
      es: "👋 ¡Bienvenido a SmartRoute Logistics! ¿Cómo puedo ayudarte hoy?",
      ur: "👋 SmartRoute Logistics میں خوش آمدید! آج میں آپ کی کیسے مدد کر سکتا ہوں؟",
      zh: "👋 欢迎来到 SmartRoute Logistics！今天我能为您提供什么帮助？"
    };

    return greetings[language] || greetings.en;
  }

  // Get common quick replies in specific language
  getQuickReplies(language) {
    const quickReplies = {
      en: [
        "Dispatching Services",
        "Factoring Services", 
        "Load Tracking",
        "Contact Support"
      ],
      es: [
        "Servicios de Despacho",
        "Servicios de Factoring",
        "Seguimiento de Carga",
        "Contactar Soporte"
      ],
      ur: [
        "ڈسپیچنگ سروسز",
        "فیکٹرنگ سروسز",
        "لوڈ ٹریکنگ", 
        "سپورٹ سے رابطہ"
      ],
      zh: [
        "调度服务",
        "保理服务",
        "货物跟踪",
        "联系客服"
      ]
    };

    return quickReplies[language] || quickReplies.en;
  }
}

module.exports = new TranslationService();