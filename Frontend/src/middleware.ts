import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value);
                        response.cookies.set(name, value, options);
                    });
                },
            },
        }
    );

    // Refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const { data: { user } } = await supabase.auth.getUser();

    // Check for dev mode bypass (for development purposes)
    const devMode = request.cookies.get('devMode')?.value === 'true' ||
        request.nextUrl.searchParams.get('devMode') === 'true';

    // Route Protection
    const isLoginPage = request.nextUrl.pathname.startsWith('/login');
    const isVerifyPage = request.nextUrl.pathname.startsWith('/verify');
    const isPublicPage = isLoginPage || isVerifyPage;

    // Bypass auth check if in dev mode
    if (devMode) {
        // Set dev mode cookie if not already set
        if (!request.cookies.get('devMode')) {
            response.cookies.set('devMode', 'true', {
                maxAge: 60 * 60 * 24 * 7, // 7 days
                path: '/'
            });
        }
        return response;
    }

    if (!user && !isPublicPage) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (user && isLoginPage) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
