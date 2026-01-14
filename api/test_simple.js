export default function handler(request, response) {
    response.status(200).json({
        message: 'Simple serverless function test',
        env_check: {
            JQUANTS: !!process.env.JQUANTS_API_KEY,
            VITE_JQUANTS: !!process.env.VITE_JQUANTS_API_KEY,
            FINNHUB: !!process.env.VITE_FINNHUB_API_KEY
        },
        keys: Object.keys(process.env).sort()
    });
}
