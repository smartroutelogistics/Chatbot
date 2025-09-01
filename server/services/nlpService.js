const OpenAI = require('openai');
const Sentiment = require('sentiment');

class NLPService {
  constructor() {
    // Initialize OpenAI (you'll need to set OPENAI_API_KEY in your .env file)
    this.openai = process.env.OPENAI_API_KEY ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    }) : null;

    // Sentiment analysis
    this.sentiment = new Sentiment();

    // SmartRoute Logistics specific intents and responses
    this.intentPatterns = {
      // Dispatcher related
      dispatching: [
        'dispatch', 'dispatcher', 'find loads', 'get loads', 'need loads',
        'load board', 'freight', 'cargo', 'hauling', 'truck loads'
      ],
      
      // Factoring related
      factoring: [
        'factoring', 'factor', 'cash flow', 'invoice', 'payment', 'money',
        'advance', 'financing', 'quick pay', 'get paid'
      ],
      
      // Brokerage related
      brokerage: [
        'broker', 'brokerage', 'shipper', 'carrier', 'freight broker',
        'move freight', 'transport', 'shipping'
      ],
      
      // Tracking related
      tracking: [
        'track', 'tracking', 'where is', 'location', 'status', 'update',
        'delivery', 'eta', 'estimated'
      ],
      
      // Support related
      support: [
        'help', 'support', 'problem', 'issue', 'contact', 'call',
        'speak to', 'human', 'agent', 'representative'
      ],
      
      // Pricing related
      pricing: [
        'price', 'cost', 'rate', 'fee', 'charge', 'how much', 'pricing',
        'commission', 'percentage'
      ],
      
      // Registration/signup
      signup: [
        'sign up', 'register', 'join', 'become', 'start', 'account',
        'application', 'onboard'
      ],

      // Company info
      about: [
        'about', 'company', 'who are', 'what is', 'information', 'services',
        'smartroute', 'smart route'
      ]
    };

    // SmartRoute specific responses by user type and language
    this.responses = {
      en: {
        trucker: {
          dispatching: "I can help you with our dispatching services! We offer 24/7 dispatch support with access to our exclusive load board. Our dispatchers work to find you the most profitable routes while you focus on driving. Would you like to know more about our dispatch rates or how to get started?",
          factoring: "Our factoring service helps you get paid faster! Instead of waiting 30-60 days for payment, we can advance you up to 95% of your invoice value within 24 hours. No hidden fees, competitive rates. Would you like to learn about our factoring process?",
          brokerage: "As a trucker, our brokerage service connects you with reliable shippers. We handle all the paperwork and negotiations to get you the best rates. Want to know how our load matching works?",
          pricing: "Our dispatch rates are as low as 3-5%, and factoring starts at competitive rates. We believe in transparent pricing with no hidden fees. Would you like a detailed breakdown?",
          support: "I'm here to help! For immediate assistance, you can call our 24/7 support line or I can connect you with a live agent. What specific issue can I help you with?",
          tracking: "You can track your loads in real-time through our platform. Each load comes with tracking updates and delivery confirmations. Need help accessing your tracking information?",
          signup: "Great! To get started as a carrier, you'll need your MC number, insurance information, and DOT number. The application process is quick and easy. Should I guide you through it?",
          about: "SmartRoute Logistics is your dedicated partner in trucking success! We offer dispatching, factoring, and brokerage services designed specifically for truckers like you. We've been helping drivers maximize their profits while minimizing paperwork since day one."
        },
        shipper: {
          dispatching: "Our professional dispatchers ensure your freight is handled by experienced drivers on optimal routes. We manage the entire process from pickup to delivery. Looking for reliable freight movement?",
          factoring: "Our factoring service ensures smooth transactions when you work with our carriers. This means faster payments and reliable service for your shipping needs.",
          brokerage: "We connect you with our network of qualified carriers to move your freight safely and efficiently. Competitive rates, reliable service, and full tracking. What type of freight do you need to ship?",
          pricing: "We offer competitive freight rates with transparent pricing. No hidden fees, just honest pricing that works for your budget. Would you like a quote for your shipment?",
          support: "Our customer service team is here to help with any shipping needs or questions. Available 24/7 to ensure your freight moves smoothly. What can I help you with today?",
          tracking: "Track your shipments in real-time with our advanced tracking system. Get updates from pickup to delivery with estimated arrival times. Need help tracking a current shipment?",
          signup: "Welcome! Setting up your shipper account is easy. We'll need some basic company information and shipping requirements. Ready to get started with reliable freight service?",
          about: "SmartRoute Logistics provides comprehensive freight and logistics solutions. We specialize in connecting reliable carriers with quality shippers, ensuring your freight moves safely, efficiently, and on time."
        }
      },
      es: {
        trucker: {
          dispatching: "¡Puedo ayudarte con nuestros servicios de despacho! Ofrecemos soporte de despacho 24/7 con acceso a nuestra plataforma exclusiva de cargas. ¿Te gustaría saber más sobre nuestras tarifas o cómo empezar?",
          factoring: "¡Nuestro servicio de factoring te ayuda a recibir pagos más rápido! En lugar de esperar 30-60 días, podemos adelantarte hasta el 95% del valor de tu factura en 24 horas. ¿Te gustaría conocer nuestro proceso?",
          brokerage: "Como camionero, nuestro servicio de corretaje te conecta con transportistas confiables. Manejamos todo el papeleo para conseguirte las mejores tarifas. ¿Quieres saber cómo funciona?",
          pricing: "Nuestras tarifas de despacho son tan bajas como 3-5%, y el factoring comienza con tarifas competitivas. Creemos en precios transparentes sin tarifas ocultas.",
          support: "¡Estoy aquí para ayudar! Para asistencia inmediata, puedes llamar a nuestra línea de soporte 24/7 o puedo conectarte con un agente. ¿Con qué problema específico puedo ayudarte?",
          tracking: "Puedes rastrear tus cargas en tiempo real a través de nuestra plataforma. ¿Necesitas ayuda para acceder a tu información de seguimiento?",
          signup: "¡Excelente! Para comenzar como transportista, necesitarás tu número MC, información de seguro y número DOT. ¿Te guío a través del proceso?",
          about: "¡SmartRoute Logistics es tu socio dedicado en el éxito del transporte! Ofrecemos servicios de despacho, factoring y corretaje diseñados específicamente para camioneros como tú."
        }
      },
      ur: {
        trucker: {
          dispatching: "میں آپ کو ہماری ڈسپیچنگ سروسز میں مدد کر سکتا ہوں! ہم 24/7 ڈسپیچ سپورٹ فراہم کرتے ہیں۔ کیا آپ ہمارے ڈسپیچ ریٹس یا شروعات کے بارے میں جاننا چاہیں گے؟",
          factoring: "ہماری فیکٹرنگ سروس آپ کو تیزی سے ادائیگی حاصل کرنے میں مدد کرتی ہے! 30-60 دنوں کا انتظار کرنے کے بجائے، ہم 24 گھنٹوں میں آپ کے انوائس کی 95% تک رقم ادا کر سکتے ہیں۔",
          brokerage: "بطور ٹرکر، ہماری بروکریج سروس آپ کو قابل اعتماد شپرز کے ساتھ جوڑتی ہے۔ کیا آپ جاننا چاہتے ہیں کہ یہ کیسے کام کرتا ہے؟",
          pricing: "ہمارے ڈسپیچ ریٹس 3-5% تک کم ہیں، اور فیکٹرنگ مسابقتی ریٹس سے شروع ہوتا ہے۔",
          support: "میں یہاں مدد کے لیے ہوں! فوری مدد کے لیے آپ ہماری 24/7 سپورٹ لائن پر کال کر سکتے ہیں۔",
          tracking: "آپ اپنے لوڈز کو ہمارے پلیٹ فارم کے ذریعے ریئل ٹائم میں ٹریک کر سکتے ہیں۔",
          signup: "بہترین! کیریئر کے طور پر شروعات کے لیے، آپ کو اپنا MC نمبر، انشورنس کی معلومات، اور DOT نمبر درکار ہوگا۔",
          about: "SmartRoute Logistics ٹرکنگ کی کامیابی میں آپ کا وقف شدہ پارٹنر ہے! ہم آپ جیسے ڈرائیورز کے لیے خاص طور پر ڈیزائن کی گئی سروسز فراہم کرتے ہیں۔"
        }
      },
      zh: {
        trucker: {
          dispatching: "我可以帮您了解我们的调度服务！我们提供24/7调度支持，让您专注于驾驶。您想了解我们的调度费率或如何开始吗？",
          factoring: "我们的保理服务帮助您更快获得付款！无需等待30-60天，我们可以在24小时内预付发票价值的95%。想了解我们的保理流程吗？",
          brokerage: "作为卡车司机，我们的经纪服务将您与可靠的货主连接起来。我们处理所有文书工作以获得最佳费率。",
          pricing: "我们的调度费率低至3-5%，保理服务也有竞争力的费率。我们相信透明定价，没有隐藏费用。",
          support: "我在这里帮助您！如需立即帮助，您可以拨打我们的24/7支持热线。",
          tracking: "您可以通过我们的平台实时跟踪您的货物。需要帮助访问您的跟踪信息吗？",
          signup: "太好了！要开始作为承运商，您需要MC号码、保险信息和DOT号码。我来指导您完成流程？",
          about: "SmartRoute Logistics是您在卡车运输成功路上的专业合作伙伴！我们专为像您这样的司机提供调度、保理和经纪服务。"
        }
      }
    };
  }

  async processMessage(text, userType = 'visitor', language = 'en', context = {}) {
    try {
      // Detect emotion/sentiment
      const emotion = this.detectEmotion(text);
      
      // Detect intent
      const intent = this.detectIntent(text);
      
      // Calculate confidence
      let confidence = this.calculateConfidence(text, intent);

      // Generate response
      let response;
      
      if (this.openai && process.env.USE_OPENAI === 'true') {
        // Use OpenAI for more sophisticated responses
        response = await this.generateOpenAIResponse(text, userType, language, intent, context);
        confidence = Math.min(confidence + 0.2, 1.0); // Boost confidence for AI responses
      } else {
        // Use pattern-based responses
        response = this.generatePatternResponse(intent, userType, language);
      }

      return {
        text: response,
        intent,
        confidence,
        emotion: emotion.label,
        language,
        suggestedActions: this.getSuggestedActions(intent, userType, language)
      };
    } catch (error) {
      console.error('NLP Processing error:', error);
      return this.getFallbackResponse(language);
    }
  }

  detectIntent(text) {
    const cleanText = text.toLowerCase();
    let bestMatch = 'general';
    let maxScore = 0;

    for (const [intent, patterns] of Object.entries(this.intentPatterns)) {
      let score = 0;
      for (const pattern of patterns) {
        if (cleanText.includes(pattern.toLowerCase())) {
          score += pattern.length; // Longer patterns get higher scores
        }
      }
      
      if (score > maxScore) {
        maxScore = score;
        bestMatch = intent;
      }
    }

    return bestMatch;
  }

  detectEmotion(text) {
    const analysis = this.sentiment.analyze(text);
    
    let emotion = 'neutral';
    if (analysis.score > 2) emotion = 'positive';
    else if (analysis.score < -2) emotion = 'negative';
    else if (analysis.score > 0) emotion = 'slightly_positive';
    else if (analysis.score < 0) emotion = 'slightly_negative';

    // Check for specific emotion keywords
    const emotionKeywords = {
      angry: ['angry', 'mad', 'furious', 'pissed', 'hate'],
      frustrated: ['frustrated', 'annoyed', 'irritated', 'fed up'],
      excited: ['excited', 'amazing', 'awesome', 'fantastic'],
      happy: ['happy', 'glad', 'pleased', 'satisfied'],
      sad: ['sad', 'disappointed', 'unhappy', 'upset']
    };

    for (const [emotionType, keywords] of Object.entries(emotionKeywords)) {
      if (keywords.some(keyword => text.toLowerCase().includes(keyword))) {
        emotion = emotionType;
        break;
      }
    }

    return {
      label: emotion,
      score: analysis.score,
      comparative: analysis.comparative
    };
  }

  calculateConfidence(text, intent) {
    let confidence = 0.5; // Base confidence

    // Increase confidence based on intent match quality
    const patterns = this.intentPatterns[intent] || [];
    const matchedPatterns = patterns.filter(pattern => 
      text.toLowerCase().includes(pattern.toLowerCase())
    );
    
    confidence += (matchedPatterns.length * 0.1);
    
    // Increase confidence for longer, more specific messages
    if (text.length > 50) confidence += 0.1;
    if (text.length > 100) confidence += 0.1;

    // Decrease confidence for very short messages
    if (text.length < 10) confidence -= 0.2;

    return Math.min(Math.max(confidence, 0.1), 1.0);
  }

  generatePatternResponse(intent, userType, language) {
    const responses = this.responses[language] || this.responses.en;
    const userResponses = responses[userType] || responses.trucker;
    
    return userResponses[intent] || userResponses.about || 
           "Thank you for contacting SmartRoute Logistics! I'm here to help with all your trucking and logistics needs. What can I assist you with today?";
  }

  async generateOpenAIResponse(text, userType, language, intent, context) {
    if (!this.openai) {
      return this.generatePatternResponse(intent, userType, language);
    }

    const systemPrompt = `You are a helpful assistant for SmartRoute Logistics, a company that provides dispatching, factoring, and brokerage services for truckers and shippers. 

Context:
- User type: ${userType}
- Language: ${language}
- Detected intent: ${intent}
- Previous interactions: ${context.previousInteractions || 0}

Guidelines:
- Be professional, friendly, and knowledgeable about logistics
- Focus on SmartRoute's services: dispatching (3-5% rates), factoring (quick payment), brokerage
- Provide specific, actionable information
- Keep responses concise but helpful
- Use appropriate language for the user type (truckers vs shippers)

Respond in ${language === 'en' ? 'English' : language === 'es' ? 'Spanish' : language === 'ur' ? 'Urdu' : 'Chinese'}.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text }
        ],
        max_tokens: 200,
        temperature: 0.7
      });

      return completion.choices[0].message.content.trim();
    } catch (error) {
      console.error('OpenAI error:', error);
      return this.generatePatternResponse(intent, userType, language);
    }
  }

  getSuggestedActions(intent, userType, language) {
    const actions = {
      en: {
        dispatching: [
          { type: 'quick_reply', title: 'Learn about dispatch rates', payload: 'dispatch_rates' },
          { type: 'quick_reply', title: 'Apply as carrier', payload: 'apply_carrier' }
        ],
        factoring: [
          { type: 'quick_reply', title: 'Factoring process', payload: 'factoring_process' },
          { type: 'quick_reply', title: 'Get quote', payload: 'factoring_quote' }
        ],
        support: [
          { type: 'quick_reply', title: 'Speak to agent', payload: 'live_agent' },
          { type: 'phone', title: 'Call support', payload: '+1-800-SMARTROUTE' }
        ],
        general: [
          { type: 'quick_reply', title: 'Our services', payload: 'services' },
          { type: 'quick_reply', title: 'Get started', payload: 'get_started' }
        ]
      }
    };

    const langActions = actions[language] || actions.en;
    return langActions[intent] || langActions.general;
  }

  getFallbackResponse(language) {
    const fallbacks = {
      en: "I'm here to help with your trucking and logistics needs! Could you please rephrase your question or let me know what specific service you're interested in?",
      es: "¡Estoy aquí para ayudar con tus necesidades de transporte y logística! ¿Podrías reformular tu pregunta o decirme en qué servicio específico estás interesado?",
      ur: "میں یہاں آپ کی ٹرکنگ اور لاجسٹکس کی ضروریات میں مدد کے لیے ہوں! کیا آپ اپنا سوال دوبارہ بیان کر سکتے ہیں؟",
      zh: "我在这里帮助您解决卡车运输和物流需求！您能重新表述您的问题或告诉我您对哪项具体服务感兴趣吗？"
    };

    return {
      text: fallbacks[language] || fallbacks.en,
      intent: 'fallback',
      confidence: 0.3,
      emotion: 'neutral',
      language
    };
  }
}

module.exports = new NLPService();