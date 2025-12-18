// src/lib/models/schemas.ts
// Location: src/lib/models/schemas.ts
// MongoDB schemas for MAXION using Mongoose

import mongoose, { Schema, Document, Model } from 'mongoose';

// ============================================================================
// USER SCHEMA
// ============================================================================

export interface IUser extends Document {
  walletAddress: string;
  createdAt: Date;
  lastActive: Date;
  totalDeposited: number;
  totalWithdrawn: number;
  riskProfile: 'conservative' | 'balanced' | 'aggressive';
}

const UserSchema = new Schema<IUser>({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
  totalDeposited: {
    type: Number,
    default: 0,
  },
  totalWithdrawn: {
    type: Number,
    default: 0,
  },
  riskProfile: {
    type: String,
    enum: ['conservative', 'balanced', 'aggressive'],
    default: 'balanced',
  },
});

UserSchema.index({ walletAddress: 1 });
UserSchema.index({ lastActive: -1 });

export const User: Model<IUser> = 
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

// ============================================================================
// ALLOCATION SCHEMA
// ============================================================================

export interface IAllocation extends Document {
  userId: mongoose.Types.ObjectId;
  walletAddress: string;
  assetId: string;
  assetName: string;
  amount: number;
  shares: number;
  apy: number;
  riskLevel: string;
  timestamp: Date;
  txHash?: string;
  status: 'pending' | 'confirmed' | 'failed';
}

const AllocationSchema = new Schema<IAllocation>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  walletAddress: {
    type: String,
    required: true,
    lowercase: true,
    index: true,
  },
  assetId: {
    type: String,
    required: true,
  },
  assetName: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  shares: {
    type: Number,
    required: true,
    min: 0,
  },
  apy: {
    type: Number,
    required: true,
  },
  riskLevel: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  txHash: {
    type: String,
    sparse: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending',
  },
});

AllocationSchema.index({ walletAddress: 1, timestamp: -1 });
AllocationSchema.index({ userId: 1, status: 1 });

export const Allocation: Model<IAllocation> = 
  mongoose.models.Allocation || mongoose.model<IAllocation>('Allocation', AllocationSchema);

// ============================================================================
// AI ANALYSIS SCHEMA
// ============================================================================

export interface IAIAnalysis extends Document {
  userId: mongoose.Types.ObjectId;
  walletAddress: string;
  query: string;
  response: string;
  context?: {
    assetId?: string;
    assetName?: string;
    amount?: number;
    riskProfile?: string;
  };
  timestamp: Date;
  modelUsed: string;
  tokensUsed?: number;
}

const AIAnalysisSchema = new Schema<IAIAnalysis>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  walletAddress: {
    type: String,
    required: true,
    lowercase: true,
    index: true,
  },
  query: {
    type: String,
    required: true,
  },
  response: {
    type: String,
    required: true,
  },
  context: {
    assetId: String,
    assetName: String,
    amount: Number,
    riskProfile: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  modelUsed: {
    type: String,
    default: 'claude-sonnet-4',
  },
  tokensUsed: {
    type: Number,
  },
});

AIAnalysisSchema.index({ walletAddress: 1, timestamp: -1 });

export const AIAnalysis: Model<IAIAnalysis> = 
  mongoose.models.AIAnalysis || mongoose.model<IAIAnalysis>('AIAnalysis', AIAnalysisSchema);