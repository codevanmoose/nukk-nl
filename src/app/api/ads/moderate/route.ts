import { NextRequest, NextResponse } from 'next/server';
import { moderateAdContent, getNextAction, sendModerationAlert, ModerationRequest } from '@/lib/ai-moderation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body: ModerationRequest & { campaignId: string; advertiserId: string } = await request.json();
    
    const { campaignId, advertiserId, ...moderationRequest } = body;

    // Validate required fields
    if (!campaignId || !advertiserId || !moderationRequest.imageUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get advertiser info for notifications
    const { data: advertiser, error: advertiserError } = await supabase
      .from('advertisers')
      .select('email, company_name')
      .eq('id', advertiserId)
      .single();

    if (advertiserError || !advertiser) {
      return NextResponse.json(
        { error: 'Advertiser not found' },
        { status: 404 }
      );
    }

    // Run AI moderation
    console.log(`Starting AI moderation for campaign ${campaignId}`);
    const moderationResult = await moderateAdContent(moderationRequest);
    
    // Determine next action
    const nextAction = getNextAction(moderationResult);
    
    // Map action to database status
    let status: string;
    let moderationStatus: string;
    
    switch (nextAction) {
      case 'auto_approve':
        status = 'approved';
        moderationStatus = 'approved';
        break;
      case 'auto_reject':
        status = 'rejected';
        moderationStatus = 'rejected';
        break;
      case 'manual_review':
        status = 'pending_review';
        moderationStatus = 'flagged';
        break;
      default:
        status = 'pending_review';
        moderationStatus = 'pending';
    }

    // Update the ad creative with moderation results
    const { error: updateError } = await supabase
      .from('ad_creatives')
      .update({
        ai_moderation_score: moderationResult.score,
        ai_moderation_notes: moderationResult.reasoning,
        ai_moderation_flags: moderationResult.flags,
        moderation_status: moderationStatus,
        status: status
      })
      .eq('campaign_id', campaignId);

    if (updateError) {
      console.error('Error updating ad creative:', updateError);
      return NextResponse.json(
        { error: 'Failed to update moderation results' },
        { status: 500 }
      );
    }

    // Update campaign status
    const { error: campaignUpdateError } = await supabase
      .from('campaigns')
      .update({
        status: status === 'approved' ? 'approved' : 'ai_review'
      })
      .eq('id', campaignId);

    if (campaignUpdateError) {
      console.error('Error updating campaign:', campaignUpdateError);
    }

    // Send notification for manual review cases
    if (nextAction === 'manual_review' || nextAction === 'auto_reject') {
      await sendModerationAlert(campaignId, advertiser.email, moderationResult);
      
      // Also send email to admin if needed manual review
      if (nextAction === 'manual_review') {
        await sendAdminModerationNotification(campaignId, advertiser.company_name, moderationResult);
      }
    }

    // Log the moderation result
    console.log(`Moderation completed for campaign ${campaignId}:`, {
      score: moderationResult.score,
      action: nextAction,
      flags: moderationResult.flags
    });

    return NextResponse.json({
      success: true,
      moderation: {
        score: moderationResult.score,
        approved: moderationResult.approved,
        flags: moderationResult.flags,
        action: nextAction,
        status: status,
        reasoning: moderationResult.reasoning
      }
    });

  } catch (error) {
    console.error('Error in ad moderation API:', error);
    return NextResponse.json(
      { error: 'Internal server error during moderation' },
      { status: 500 }
    );
  }
}

async function sendAdminModerationNotification(
  campaignId: string,
  companyName: string,
  result: any
): Promise<void> {
  // TODO: Implement admin email notification
  console.log(`ADMIN NOTIFICATION: Manual review needed for campaign ${campaignId}`);
  console.log(`Company: ${companyName}`);
  console.log(`AI Score: ${result.score}`);
  console.log(`Flags: ${result.flags.join(', ')}`);
  
  // This would send an email to admin@nukk.nl with:
  // - Campaign details
  // - AI moderation results
  // - Link to admin dashboard for review
  // - Recommended action
}