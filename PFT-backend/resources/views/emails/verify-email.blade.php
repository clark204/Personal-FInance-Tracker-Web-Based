<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Verify Your Email Address</title>
    <style>
        /* Reset and base styles */
        body, html {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background-color: #f8fafc;
            line-height: 1.6;
            color: #334155;
        }
        
        .container {
            max-width: 500px;
            margin: 40px auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05), 0 5px 10px rgba(0, 0, 0, 0.02);
            overflow: hidden;
            border: 1px solid #e2e8f0;
        }
        
        .header {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            padding: 40px 20px;
            text-align: center;
            color: white;
        }
        
        .logo {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
            letter-spacing: -0.5px;
        }
        
        .logo-icon {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            width: 50px;
            height: 50px;
            border-radius: 12px;
            line-height: 50px;
            margin-bottom: 15px;
            font-size: 24px;
        }
        
        .header h1 {
            font-size: 24px;
            font-weight: 600;
            margin: 0;
            opacity: 0.95;
        }
        
        .content {
            padding: 40px 32px;
        }
        
        .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 24px;
        }
        
        .message {
            color: #64748b;
            font-size: 15px;
            margin-bottom: 32px;
            line-height: 1.7;
        }
        
        .button-container {
            margin: 32px 0;
            text-align: center;
        }
        
        .verify-button {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            text-decoration: none;
            padding: 16px 40px;
            border-radius: 10px;
            font-weight: 600;
            font-size: 16px;
            letter-spacing: 0.3px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        
        .verify-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(255, 255, 255, 0.4);
        }
        
        .divider {
            height: 1px;
            background: linear-gradient(to right, transparent, #e2e8f0, transparent);
            margin: 32px 0;
        }
        
        .code-container {
            background: #f8fafc;
            border-radius: 10px;
            padding: 20px;
            margin: 24px 0;
            border: 1px solid #e2e8f0;
            text-align: center;
        }
        
        .code {
            font-family: 'Monaco', 'Courier New', monospace;
            font-size: 28px;
            font-weight: 700;
            color: #1d4ed8;
            letter-spacing: 8px;
            background: white;
            padding: 15px;
            border-radius: 8px;
            display: inline-block;
            border: 2px dashed #e2e8f0;
        }
        
        .alternative {
            font-size: 14px;
            color: #64748b;
            text-align: center;
            margin-top: 24px;
            line-height: 1.6;
        }
        
        .footer {
            background: #f8fafc;
            padding: 24px 32px;
            border-top: 1px solid #e2e8f0;
            font-size: 13px;
            color: #94a3b8;
            text-align: center;
        }
        
        .footer a {
            color: #64748b;
            text-decoration: none;
        }
        
        .footer a:hover {
            color: #3b82f6;
        }
        
        .warning {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 16px;
            border-radius: 8px;
            margin: 24px 0;
            font-size: 14px;
            color: #92400e;
        }
        
        .expiry {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: #ecfdf5;
            color: #065f46;
            padding: 10px 16px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            margin-top: 16px;
        }
        
        @media (max-width: 520px) {
            .container {
                margin: 20px 10px;
                border-radius: 12px;
            }
            
            .content {
                padding: 30px 20px;
            }
            
            .header {
                padding: 30px 20px;
            }
            
            .code {
                font-size: 22px;
                letter-spacing: 6px;
                padding: 12px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header Section -->
        <div class="header">
            <div class="logo-icon">✓</div>
            <h1>Verify Your Email</h1>
            <p style="opacity: 0.9; margin-top: 8px; font-size: 14px;">Complete your account setup</p>
        </div>
        
        <!-- Content Section -->
        <div class="content">
            <div class="greeting">Hello, {{ $user->name }} 👋</div>
            
            <div class="message">
                Welcome to our platform! To start using all features, we need to verify your email address.
                This helps us keep your account secure and ensure you receive important updates.
            </div>
            
            <!-- Verification Button -->
            <div class="button-container">
                <a href="{{ $verifyUrl }}" class="verify-button">
                    Verify Email Address
                </a>
            </div>
            
            <!-- Alternative Method (if you have verification code) -->
            <!--
            <div class="divider"></div>
            <div class="alternative">
                <p style="margin-bottom: 12px;">Or enter this verification code in the app:</p>
                <div class="code-container">
                    <div class="code">6D8F3A</div>
                </div>
                <div class="expiry">
                    <span>⏱️</span>
                    <span>Code expires in 24 hours</span>
                </div>
            </div>
            -->
            
            <div class="divider"></div>
            
            <!-- Warning/Note -->
            <div class="warning">
                <strong>Note:</strong> For security reasons, this verification link will expire in 24 hours.
                If you don't verify within this time, you'll need to request a new verification email.
            </div>
            
            <div class="alternative">
                If you're having trouble clicking the button, copy and paste this URL into your browser:
                <br><br>
                <a href="{{ $verifyUrl }}" style="color: #3b82f6; word-break: break-all;">{{ $verifyUrl }}</a>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p style="margin-bottom: 8px;">
                If you didn't create an account with us, you can safely ignore this email.
            </p>
            <p>
                Questions? Contact our <a href="mailto:support@example.com">support team</a> • 
                <a href="{{ config('app.url') }}/privacy">Privacy Policy</a> • 
                <a href="{{ config('app.url') }}">Visit Website</a>
            </p>
            <p style="margin-top: 16px; font-size: 12px; opacity: 0.7;">
                © {{ date('Y') }} Your Company. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>