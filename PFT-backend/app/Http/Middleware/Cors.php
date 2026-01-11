<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class Cors
{
    public function handle(Request $request, Closure $next)
    {
        // Get the origin from the request
        $origin = $request->headers->get('Origin');
        
        // List of allowed origins
        $allowedOrigins = [
            'https://personal-f-inance-tracker-web-based.vercel.app',
            'https://personal-f-inance-tracker-web-based-58rzb31px.vercel.app',
            'http://localhost:5173',
            'http://localhost:3000',
        ];
        
        // Check if origin matches pattern (for Vercel preview deployments)
        $isVercelPreview = preg_match('/^https:\/\/personal-f-inance-tracker-web-based.*\.vercel\.app$/', $origin);
        
        // Handle preflight OPTIONS request
        if ($request->isMethod('OPTIONS')) {
            return response('', 200)
                ->header('Access-Control-Allow-Origin', $origin)
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept')
                ->header('Access-Control-Allow-Credentials', 'true')
                ->header('Access-Control-Max-Age', '86400');
        }
        
        // Process the actual request
        $response = $next($request);
        
        // Add CORS headers if origin is allowed
        if (in_array($origin, $allowedOrigins) || $isVercelPreview) {
            $response->headers->set('Access-Control-Allow-Origin', $origin);
            $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
            $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
            $response->headers->set('Access-Control-Allow-Credentials', 'true');
        }
        
        return $response;
    }
}