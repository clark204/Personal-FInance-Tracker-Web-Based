<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Verify Your Email</title>
    <style>
        /* Minimal inline styles for email clients */
        body { font-family: Arial, sans-serif; background-color: #f3f4f6; margin:0; padding:0; }
        .container { max-width: 500px; margin: auto; background: #fff; padding: 20px; border-radius: 10px; }
        .button { display:block; width: 100%; text-align:center; padding:12px; background:#2563eb; color:white; border-radius:6px; text-decoration:none; }
    </style>
</head>
<body>
    <div class="container">
        <h2>Hello, {{ $user->name }}</h2>
        <p>Click the button below to verify your email:</p>
        <a href="{{ $verifyUrl }}" class="button">Verify Email</a>
        <p style="font-size: 0.85rem; color: #6b7280;">If you did not create an account, you can safely ignore this email.</p>
    </div>
</body>
</html>
