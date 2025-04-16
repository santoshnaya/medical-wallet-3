import { NextResponse } from 'next/server';
import twilio from 'twilio';

interface TwilioError extends Error {
  code?: number;
  status?: number;
  moreInfo?: string;
}

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = '+17742608726'; // Using the correct Twilio number

// Validate Twilio credentials
if (!accountSid || !authToken) {
  console.error('Missing Twilio credentials:', {
    hasAccountSid: !!accountSid,
    hasAuthToken: !!authToken
  });
  throw new Error('Twilio credentials are not properly configured');
}

const client = twilio(accountSid, authToken);

export async function POST(request: Request) {
  try {
    const { phoneNumber, location } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    console.log('Attempting to send SMS with:', {
      to: phoneNumber,
      from: twilioPhoneNumber,
      location
    });

    // Create a Verify Service if it doesn't exist
    let verifyService;
    try {
      verifyService = await client.verify.v2.services.create({
        friendlyName: 'Medical Wallet Emergency Alerts'
      });
    } catch {
      // If service already exists, fetch it
      const services = await client.verify.v2.services.list();
      verifyService = services[0];
    }

    // Send verification code
    const verification = await client.verify.v2
      .services(verifyService.sid)
      .verifications.create({
        to: phoneNumber,
        channel: 'sms'
      });

    // If verification is successful, send the emergency message
    if (verification.status === 'pending') {
      const message = await client.messages.create({
        body: `EMERGENCY ALERT: A crash has been detected at location: ${location}. Emergency services have been notified.`,
        from: twilioPhoneNumber,
        to: phoneNumber
      });

      console.log('SMS sent successfully:', message.sid);
      return NextResponse.json({ 
        success: true, 
        messageId: message.sid,
        verificationStatus: verification.status
      });
    }

    return NextResponse.json({ 
      success: false, 
      error: 'Failed to send verification',
      verificationStatus: verification.status
    });

  } catch (error) {
    const twilioError = error as TwilioError;
    console.error('Detailed error sending SMS:', {
      message: twilioError.message,
      code: twilioError.code,
      status: twilioError.status,
      moreInfo: twilioError.moreInfo
    });
    
    // Handle specific Twilio error codes
    if (twilioError.code === 21408) {
      return NextResponse.json(
        { 
          error: 'Phone number not verified',
          details: 'Please verify the destination phone number in your Twilio account first.',
          code: twilioError.code
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to send SMS',
        details: twilioError.message,
        code: twilioError.code
      },
      { status: 500 }
    );
  }
} 