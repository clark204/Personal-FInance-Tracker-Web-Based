<!DOCTYPE html>
<html>
<head>
    <title>Verify Your Email</title>
</head>
<body>
    <h2>Hello, {{ $user->name }}</h2>
    <p>Click the link below to verify your email:</p>
    <a href="{{ $verifyUrl }}">Verify Email</a>
    <p>If you did not create an account, you can ignore this email.</p>
</body>
</html>
