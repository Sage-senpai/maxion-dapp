// src/app/api/ai/analyze/route.ts
// AI analysis API with Supabase

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { z } from 'zod';

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
    const body = await request.json();
    
    const validation = analyzeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { walletAddress, query, context } = validation.data;
    const normalized = walletAddress.toLowerCase();

    // Get or create user
    let { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, risk_profile')
      .eq('wallet_address', normalized)
      .single();

    if (userError && userError.code === 'PGRST116') {
      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert({ wallet_address: normalized, risk_profile: 'balanced' })
        .select('id, risk_profile')
        .single();

      if (createError) throw createError;
      user = newUser;
    } else if (userError) {
      throw userError;
    }

    // Generate AI response (using your existing logic)
    const aiResponse = await generateAIResponse(query, context, user!.risk_profile);

    // Save analysis to database
    const { data: analysis, error } = await supabaseAdmin
      .from('ai_analyses')
      .insert({
        user_id: user!.id,
        wallet_address: normalized,
        query,
        response: aiResponse.response,
        context: context || null,
        model_used: aiResponse.model,
        tokens_used: aiResponse.tokensUsed,
      })
      .select()
      .single();

    if (error) throw error;

    // Update user last active
    await supabaseAdmin
      .from('users')
      .update({ last_active: new Date().toISOString() })
      .eq('id', user!.id);

    return NextResponse.json({
      success: true,
      analysis: {
        id: analysis.id,
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

    const { data: history, error } = await supabaseAdmin
      .from('ai_analyses')
      .select('*')
      .eq('wallet_address', normalized)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      history: history.map(h => ({
        id: h.id,
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

// Helper function (keep your existing AI response logic)
async function generateAIResponse(
  query: string,
  context: any,
  userRiskProfile: string
): Promise<{ response: string; model: string; tokensUsed: number }> {
  // Your existing AI response generation logic here
  const response = generateStructuredResponse(query, context, userRiskProfile);
  
  return {
    response,
    model: 'claude-sonnet-4',
    tokensUsed: Math.ceil(response.length / 4),
  };
}

// Keep your existing generateStructuredResponse function
function generateStructuredResponse(
  query: string,
  context: any,
  riskProfile: string
): string {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('yield') || lowerQuery.includes('why')) {
    if (context?.assetName) {
      return `The ${context.assetName} generates yield through diversified revenue streams. The ${context.apy}% APY reflects current market conditions and asset performance.`;
    }
  }
  
  return "I can help you understand yield sources, risk factors, and allocation strategies. What would you like to explore?";
}