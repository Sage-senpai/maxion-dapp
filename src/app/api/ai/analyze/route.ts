// app/api/ai/analyze/route.ts
// AI analysis API endpoint for MAXION
// Integrates with LLM for yield explanation and risk assessment

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { AIAnalysis, User } from '@/lib/models/schemas';
import { z } from 'zod';

// Validation schema
const analyzeSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  query: z.string().min(1).max(500),
  context: z.object({
    assetId: z.string().optional(),
    assetName: z.string().optional(),
    amount: z.number().optional(),
    apy: z.number().optional(),
    riskLevel: z.string().optional(),
    riskProfile: z.string().optional(),
  }).optional(),
});

// ============================================================================
// POST - Generate AI analysis
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    
    // Validate input
    const validation = analyzeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { walletAddress, query, context } = validation.data;
    const normalized = walletAddress.toLowerCase();

    // Find or create user
    let user = await User.findOne({ walletAddress: normalized });
    if (!user) {
      user = await User.create({
        walletAddress: normalized,
        riskProfile: 'balanced',
      });
    }

    // Generate AI response
    const aiResponse = await generateAIResponse(query, context, user.riskProfile);

    // Save analysis to database
    const analysis = await AIAnalysis.create({
      userId: user._id,
      walletAddress: normalized,
      query,
      response: aiResponse.response,
      context,
      modelUsed: aiResponse.model,
      tokensUsed: aiResponse.tokensUsed,
    });

    // Update user last active
    user.lastActive = new Date();
    await user.save();

    return NextResponse.json({
      success: true,
      analysis: {
        id: analysis._id,
        query: analysis.query,
        response: analysis.response,
        timestamp: analysis.timestamp,
      },
    });
  } catch (error) {
    console.error('POST /api/ai/analyze error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET - Fetch conversation history
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    const normalized = walletAddress.toLowerCase();

    const history = await AIAnalysis.find({ walletAddress: normalized })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      history: history.map(h => ({
        id: h._id,
        query: h.query,
        response: h.response,
        context: h.context,
        timestamp: h.timestamp,
      })),
    });
  } catch (error) {
    console.error('GET /api/ai/analyze error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// AI RESPONSE GENERATION
// ============================================================================

async function generateAIResponse(
  query: string,
  context: any,
  userRiskProfile: string
): Promise<{ response: string; model: string; tokensUsed: number }> {
  // Build prompt based on query type and context
  const systemPrompt = buildSystemPrompt(userRiskProfile);
  const userPrompt = buildUserPrompt(query, context);

  // In production, this would call your LLM API (OpenAI, Anthropic, etc.)
  // For hackathon demo, we'll use rule-based responses with structured templates
  
  const response = generateStructuredResponse(query, context, userRiskProfile);

  return {
    response,
    model: 'claude-sonnet-4', // Or your chosen model
    tokensUsed: estimateTokens(systemPrompt + userPrompt + response),
  };
}

function buildSystemPrompt(riskProfile: string): string {
  return `You are MAXION's AI analyst, an expert in real-world asset (RWA) yield analysis.
Your role is to:
1. Explain yield sources and mechanisms clearly
2. Assess risk factors objectively
3. Provide allocation recommendations based on user's ${riskProfile} risk profile
4. Use data-driven insights while being transparent about uncertainties

Be concise, professional, and always prioritize user education over promotion.`;
}

function buildUserPrompt(query: string, context: any): string {
  let prompt = `User question: ${query}\n\n`;
  
  if (context?.assetName) {
    prompt += `Context:\n`;
    prompt += `- Asset: ${context.assetName}\n`;
    if (context.apy) prompt += `- APY: ${context.apy}%\n`;
    if (context.riskLevel) prompt += `- Risk Level: ${context.riskLevel}\n`;
    if (context.amount) prompt += `- Allocation Amount: $${context.amount.toLocaleString()}\n`;
  }
  
  return prompt;
}

function generateStructuredResponse(
  query: string,
  context: any,
  riskProfile: string
): string {
  const lowerQuery = query.toLowerCase();
  
  // Yield explanation
  if (lowerQuery.includes('yield') || lowerQuery.includes('why')) {
    if (context?.assetName) {
      return `The ${context.assetName} generates yield through ${getYieldMechanism(context.assetName)}. 

The ${context.apy}% APY comes from:
1. Interest payments on underlying assets
2. Strategic asset appreciation
3. Operational cash flows

This yield is ${context.riskLevel?.toLowerCase() || 'moderately'} risk because ${getRiskExplanation(context.riskLevel)}.`;
    }
    return "Yield in RWA assets typically comes from real-world revenue streams like rent, interest payments, or business cash flows. The rate depends on the underlying asset quality and market conditions.";
  }
  
  // Risk assessment
  if (lowerQuery.includes('risk')) {
    if (context?.riskLevel) {
      return `Risk Assessment for ${context.assetName || 'this asset'}:

${context.riskLevel} risk level indicates:
${getRiskDetails(context.riskLevel)}

Key factors to consider:
• Liquidity: ${getLiquidityComment(context.riskLevel)}
• Volatility: ${getVolatilityComment(context.riskLevel)}
• Regulatory: ${getRegulatoryComment(context.riskLevel)}

Given your ${riskProfile} profile, ${getProfileMatch(riskProfile, context.riskLevel)}.`;
    }
    return "RWA investments carry different risk profiles. Key risks include market volatility, liquidity constraints, regulatory changes, and underlying asset performance. Always diversify across multiple assets.";
  }
  
  // Allocation advice
  if (lowerQuery.includes('allocat') || lowerQuery.includes('invest') || lowerQuery.includes('conservative')) {
    return `For a ${riskProfile} investor, I recommend:

${getAllocationStrategy(riskProfile)}

${context?.amount ? `For your $${context.amount.toLocaleString()} allocation:
• Start with 60-70% in low-risk assets (Treasury bonds, infrastructure)
• 20-30% in medium-risk (real estate, private credit)
• 10% maximum in higher-yield opportunities

This balances yield optimization with capital preservation.` : ''}`;
  }
  
  // Comparison
  if (lowerQuery.includes('compar') || lowerQuery.includes('alternative')) {
    return `When comparing RWA yield options, consider:

1. **Yield Quality**: Is it sustainable? What's the source?
2. **Risk-Adjusted Returns**: Higher APY isn't always better
3. **Liquidity**: How quickly can you exit?
4. **Track Record**: Historical performance matters

${context?.assetName ? `${context.assetName} offers ${context.apy}% APY, which is ${getYieldComparison(context.apy)} compared to market alternatives.` : ''}`;
  }
  
  // Default response
  return `I can help you understand:
• Yield sources and sustainability
• Risk factors and mitigation
• Allocation strategies for your ${riskProfile} profile
• Asset comparisons and alternatives

What specific aspect would you like to explore?`;
}

// Helper functions for response generation
function getYieldMechanism(assetName: string): string {
  if (assetName.includes('Treasury')) return 'US government bond interest payments with automated distribution';
  if (assetName.includes('Real Estate')) return 'rental income from commercial properties and capital appreciation';
  if (assetName.includes('Credit')) return 'interest on senior secured loans to established businesses';
  if (assetName.includes('Infrastructure')) return 'long-term cash flows from essential infrastructure projects';
  return 'diversified revenue streams from underlying real-world assets';
}

function getRiskExplanation(riskLevel: string): string {
  if (riskLevel === 'Low') return 'it\'s backed by government securities with high credit quality';
  if (riskLevel === 'Medium') return 'it involves established asset classes with moderate volatility';
  if (riskLevel === 'High') return 'it targets higher returns through less liquid or more volatile assets';
  return 'it balances stability with growth potential';
}

function getRiskDetails(riskLevel: string): string {
  const details: Record<string, string> = {
    'Low': '• Minimal capital loss risk\n• Stable, predictable returns\n• High credit quality\n• Government backing or senior security',
    'Low-Medium': '• Limited downside risk\n• Moderate return stability\n• Established asset classes\n• Good collateralization',
    'Medium': '• Balanced risk-return profile\n• Some volatility expected\n• Diversified exposure\n• Professional management',
    'Medium-High': '• Higher potential returns\n• Increased volatility\n• Specific sector exposure\n• Active monitoring needed',
    'High': '• Significant return potential\n• Notable volatility\n• Concentrated positions\n• Advanced investor suitable',
  };
  return details[riskLevel] || details['Medium'];
}

function getLiquidityComment(riskLevel: string): string {
  if (riskLevel === 'Low') return 'High - can exit within days';
  if (riskLevel?.includes('Medium')) return 'Moderate - typical lock-up periods';
  return 'Limited - longer commitment required';
}

function getVolatilityComment(riskLevel: string): string {
  if (riskLevel === 'Low') return 'Minimal price fluctuations';
  if (riskLevel?.includes('Medium')) return 'Moderate fluctuations expected';
  return 'Potential for significant swings';
}

function getRegulatoryComment(riskLevel: string): string {
  return 'Well-regulated with compliance oversight';
}

function getProfileMatch(profile: string, riskLevel: string): string {
  if (profile === 'conservative' && riskLevel === 'Low') return 'this is an excellent match';
  if (profile === 'conservative' && riskLevel?.includes('High')) return 'this may be too aggressive';
  if (profile === 'aggressive' && riskLevel === 'Low') return 'you might consider higher-yield options';
  return 'this could fit your portfolio with proper diversification';
}

function getAllocationStrategy(profile: string): string {
  const strategies: Record<string, string> = {
    conservative: '• 70% Low-risk (Treasury, Infrastructure)\n• 25% Low-Medium risk (Real Estate)\n• 5% Medium risk for diversification',
    balanced: '• 40% Low-risk for stability\n• 40% Medium-risk for growth\n• 20% Medium-High for enhanced returns',
    aggressive: '• 20% Low-risk as foundation\n• 40% Medium-risk\n• 40% Medium-High and High for maximum yield',
  };
  return strategies[profile] || strategies.balanced;
}
function getYieldComparison(apy: number): string {
  if (apy < 5) return 'conservative but stable';
  if (apy < 8) return 'competitive for moderate risk';
  if (apy < 12) return 'attractive for the risk level';
  return 'high, requiring careful risk assessment';
}

function estimateTokens(text: string): number {
  // Rough estimation: ~4 characters per token
  return Math.ceil(text.length / 4);
}