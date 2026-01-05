{{-- resources/views/emails/account-deleted.blade.php --}}
<!DOCTYPE html>
<html>
<head>
    <title>Account Deleted</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            border-left: 4px solid #dc3545;
        }
        .content {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e9ecef;
        }
        .warning-box {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
        }
        .info-box {
            background-color: #e7f5ff;
            border: 1px solid #d0ebff;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            font-size: 12px;
            color: #6c757d;
        }
        .btn {
            display: inline-block;
            padding: 10px 20px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            margin: 10px 0;
        }
        .alert {
            color: #dc3545;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="header">
        <h2>Account Deletion Confirmation</h2>
    </div>
    
    <div class="content">
        <p>Dear {{ $user->name }},</p>
        
        <div class="warning-box">
            <p class="alert">⚠️ IMPORTANT: Your account has been permanently deleted.</p>
        </div>
        
        <p>This email confirms that your account with the following details has been permanently deleted:</p>
        
        <ul>
            <li><strong>Account Name:</strong> {{ $user->name }}</li>
            <li><strong>Email Address:</strong> {{ $user->email }}</li>
            <li><strong>Deletion Date:</strong> {{ $deletionDate }}</li>
            <li><strong>Account ID:</strong> {{ $user->id }}</li>
        </ul>
        
        <div class="info-box">
            <h4>What this means:</h4>
            <ul>
                <li>All your personal data has been permanently removed from our systems</li>
                <li>All your accounts, transactions, budgets, and savings data have been deleted</li>
                <li>You will no longer be able to access our services with this account</li>
                <li>Any active subscriptions have been cancelled</li>
                <li>This action cannot be undone</li>
            </ul>
        </div>
        
        <h4>Need Help?</h4>
        <p>If you did not request this deletion or believe this was done in error:</p>
        <ul>
            <li>Contact our support team immediately at <a href="mailto:support@financetracker.com">support@financetracker.com</a></li>
            <li>Include your account email address in your message</li>
            <li>We may be able to recover some data if contacted within 24 hours</li>
        </ul>
        
        <p>We're sorry to see you go. If you ever decide to use our services again, you'll need to create a new account.</p>
        
        <p>Thank you for being a part of our community.</p>
    </div>
    
    <div class="footer">
        <p>This is an automated message. Please do not reply to this email.</p>
        <p>© {{ date('Y') }} FinanceTracker. All rights reserved.</p>
        <p>
            FinanceTracker Inc.<br>
            123 Finance Street, Suite 100<br>
            San Francisco, CA 94107
        </p>
    </div>
</body>
</html>