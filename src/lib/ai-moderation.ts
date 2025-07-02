import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ModerationResult {
  score: number; // 0-1, where 1 is completely safe
  approved: boolean;
  flags: string[];
  details: {
    adultContent: number;
    violence: number;
    hateSpeech: number;
    misleadingClaims: number;
    poorQuality: number;
    trademark: number;
  };
  reasoning: string;
}

export interface ModerationRequest {
  imageUrl: string;
  clickUrl: string;
  campaignName: string;
  description?: string;
}

// Content moderation thresholds
const MODERATION_THRESHOLDS = {
  autoApprove: 0.85,  // Auto-approve if score >= 0.85
  autoReject: 0.30,   // Auto-reject if score <= 0.30
  manualReview: 0.70, // Manual review if score between 0.30-0.70
};

// Flaggable content categories
const CONTENT_FLAGS = {
  ADULT_CONTENT: 'adult_content',
  VIOLENCE: 'violence',
  HATE_SPEECH: 'hate_speech',
  MISLEADING_CLAIMS: 'misleading_claims',
  POOR_QUALITY: 'poor_quality',
  TRADEMARK_VIOLATION: 'trademark_violation',
  GAMBLING: 'gambling',
  WEAPONS: 'weapons',
  DRUGS: 'drugs',
  SCAM_INDICATORS: 'scam_indicators'
} as const;

export async function moderateAdContent(request: ModerationRequest): Promise<ModerationResult> {
  try {
    // Use OpenAI Vision API to analyze the image
    const visionResponse = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `
Analyze this advertisement image for a Dutch fact-checking platform (nukk.nl) that serves educated, critical-thinking users.

Campaign: "${request.campaignName}"
Description: "${request.description || 'None provided'}"
Click URL: "${request.clickUrl}"

Rate each category from 0-1 (1 = completely safe):

1. ADULT_CONTENT: Sexual content, nudity, adult themes
2. VIOLENCE: Violence, gore, weapons, threats
3. HATE_SPEECH: Discrimination, hate symbols, offensive content
4. MISLEADING_CLAIMS: False health claims, scams, fake news
5. POOR_QUALITY: Blurry, pixelated, unprofessional design
6. TRADEMARK: Copyright/trademark violations, unauthorized logos

Also consider:
- Professional appearance suitable for educated audience
- Truthful advertising claims
- Appropriate for fact-checking platform context
- Dutch cultural sensitivity

Return ONLY a JSON object with this exact structure:
{
  "adultContent": 0.95,
  "violence": 0.98,
  "hateSpeech": 0.99,
  "misleadingClaims": 0.85,
  "poorQuality": 0.80,
  "trademark": 0.90,
  "reasoning": "Brief explanation of the assessment"
}
              `
            },
            {
              type: "image_url",
              image_url: {
                url: request.imageUrl
              }
            }
          ]
        }
      ],
      max_tokens: 500,
      temperature: 0.1 // Low temperature for consistent results
    });

    const content = visionResponse.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI Vision API');
    }

    // Parse the JSON response
    let analysisResult;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      // Fallback to safe defaults if parsing fails
      analysisResult = {
        adultContent: 0.8,
        violence: 0.8,
        hateSpeech: 0.8,
        misleadingClaims: 0.6, // More conservative for claims
        poorQuality: 0.7,
        trademark: 0.8,
        reasoning: 'Failed to parse detailed analysis, using conservative scores'
      };
    }

    // Calculate overall safety score (weighted average)
    const weights = {
      adultContent: 0.2,
      violence: 0.2,
      hateSpeech: 0.25,
      misleadingClaims: 0.15, // High weight for fact-checking platform
      poorQuality: 0.1,
      trademark: 0.1
    };

    const overallScore = Object.entries(weights).reduce((sum, [category, weight]) => {
      return sum + (analysisResult[category] * weight);
    }, 0);

    // Determine flags based on individual category scores
    const flags: string[] = [];
    if (analysisResult.adultContent < 0.7) flags.push(CONTENT_FLAGS.ADULT_CONTENT);
    if (analysisResult.violence < 0.7) flags.push(CONTENT_FLAGS.VIOLENCE);
    if (analysisResult.hateSpeech < 0.7) flags.push(CONTENT_FLAGS.HATE_SPEECH);
    if (analysisResult.misleadingClaims < 0.6) flags.push(CONTENT_FLAGS.MISLEADING_CLAIMS);
    if (analysisResult.poorQuality < 0.5) flags.push(CONTENT_FLAGS.POOR_QUALITY);
    if (analysisResult.trademark < 0.7) flags.push(CONTENT_FLAGS.TRADEMARK_VIOLATION);

    // Additional URL-based checks
    await checkSuspiciousUrl(request.clickUrl, flags);

    // Determine approval status
    const approved = overallScore >= MODERATION_THRESHOLDS.autoApprove && flags.length === 0;

    return {
      score: Math.round(overallScore * 100) / 100,
      approved,
      flags,
      details: analysisResult,
      reasoning: analysisResult.reasoning || 'Automated AI moderation assessment'
    };

  } catch (error) {
    console.error('Error in AI moderation:', error);
    
    // Return conservative result on error
    return {
      score: 0.5,
      approved: false,
      flags: ['manual_review_required'],
      details: {
        adultContent: 0.5,
        violence: 0.5,
        hateSpeech: 0.5,
        misleadingClaims: 0.5,
        poorQuality: 0.5,
        trademark: 0.5
      },
      reasoning: 'Error during moderation - manual review required'
    };
  }
}

async function checkSuspiciousUrl(url: string, flags: string[]): Promise<void> {
  try {
    // Basic URL validation
    const urlObj = new URL(url);
    
    // Check for suspicious domains
    const suspiciousDomains = [
      'bit.ly', 'tinyurl.com', 'short.link', 't.co', // URL shorteners
      'free-money.com', 'get-rich-quick.net', // Scam indicators
    ];
    
    if (suspiciousDomains.some(domain => urlObj.hostname.includes(domain))) {
      flags.push(CONTENT_FLAGS.SCAM_INDICATORS);
    }

    // Check for suspicious patterns in URL
    const suspiciousPatterns = [
      /free.*money/i,
      /get.*rich.*quick/i,
      /lose.*weight.*fast/i,
      /miracle.*cure/i,
      /crypto.*invest/i
    ];

    const fullUrl = url.toLowerCase();
    if (suspiciousPatterns.some(pattern => pattern.test(fullUrl))) {
      flags.push(CONTENT_FLAGS.MISLEADING_CLAIMS);
    }

  } catch (error) {
    // Invalid URL
    flags.push('invalid_url');
  }
}

// Function to get human-readable flag descriptions
export function getFlagDescription(flag: string): string {
  const descriptions: Record<string, string> = {
    [CONTENT_FLAGS.ADULT_CONTENT]: 'Bevat mogelijk ongepaste of seksuele content',
    [CONTENT_FLAGS.VIOLENCE]: 'Bevat geweld, wapens of dreigende inhoud',
    [CONTENT_FLAGS.HATE_SPEECH]: 'Bevat mogelijk discriminerende of haatdragende content',
    [CONTENT_FLAGS.MISLEADING_CLAIMS]: 'Bevat mogelijk misleidende claims of valse informatie',
    [CONTENT_FLAGS.POOR_QUALITY]: 'Lage beeldkwaliteit of onprofessioneel ontwerp',
    [CONTENT_FLAGS.TRADEMARK_VIOLATION]: 'Mogelijk inbreuk op auteursrechten of handelsmerken',
    [CONTENT_FLAGS.GAMBLING]: 'Gerelateerd aan gokken of kansspelen',
    [CONTENT_FLAGS.WEAPONS]: 'Bevat wapens of geweld',
    [CONTENT_FLAGS.DRUGS]: 'Gerelateerd aan drugs of illegale substanties',
    [CONTENT_FLAGS.SCAM_INDICATORS]: 'Verdachte URL of oplichting indicatoren',
    'manual_review_required': 'Handmatige review vereist',
    'invalid_url': 'Ongeldige bestemming URL'
  };

  return descriptions[flag] || `Onbekende vlag: ${flag}`;
}

// Function to determine next action based on moderation result
export function getNextAction(result: ModerationResult): 'auto_approve' | 'auto_reject' | 'manual_review' {
  if (result.score >= MODERATION_THRESHOLDS.autoApprove && result.flags.length === 0) {
    return 'auto_approve';
  }
  
  if (result.score <= MODERATION_THRESHOLDS.autoReject || result.flags.length > 2) {
    return 'auto_reject';
  }
  
  return 'manual_review';
}

// Email notification for manual review
export async function sendModerationAlert(
  campaignId: string,
  advertiserEmail: string,
  result: ModerationResult
): Promise<void> {
  // TODO: Implement email notification
  console.log(`MODERATION ALERT: Campaign ${campaignId} needs review`);
  console.log(`Advertiser: ${advertiserEmail}`);
  console.log(`Score: ${result.score}, Flags: ${result.flags.join(', ')}`);
  console.log(`Reasoning: ${result.reasoning}`);
  
  // This would send an email to admin@nukk.nl with the moderation details
}