export const config = {
  runtime: "edge",
};

export default async function handler(request: Request) {
  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
        "Access-Control-Allow-Headers": "if-none-match, authorization",
      },
    });
  }

  const url = new URL(request.url);
  const targetUrl = url.searchParams.get("url");

  if (!targetUrl) {
    return new Response("Missing url parameter", { status: 400 });
  }

  try {
    const fetchOptions: RequestInit = {
      method: request.method,
      headers: {
        "User-Agent": "Integri-AI-App",
      },
    };

    // Use Private Key/Token if stored in Vercel Environment Variables to unlock 5k limits
    if (process.env.GITHUB_TOKEN) {
      (fetchOptions.headers as Record<string, string>)["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    // Forward ETag Cache Header if present
    const ifNoneMatch = request.headers.get("if-none-match");
    if (ifNoneMatch) {
      (fetchOptions.headers as Record<string, string>)["If-None-Match"] = ifNoneMatch;
    }

    const githubResponse = await fetch(targetUrl, fetchOptions);

    const newHeaders = new Headers();
    newHeaders.set("Access-Control-Allow-Origin", "*");
    newHeaders.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    // Ensure we explicitly dictate it's a binary ZIP stream
    newHeaders.set("Content-Type", "application/zip");
    
    // Pass essential response headers back
    const etag = githubResponse.headers.get("etag");
    if (etag) newHeaders.set("etag", etag);

    const contentLength = githubResponse.headers.get("content-length");
    if (contentLength) newHeaders.set("content-length", contentLength);
    
    // Pass rate limit mapping headers back
    ["x-ratelimit-remaining", "x-ratelimit-reset", "x-ratelimit-used", "x-ratelimit-limit"].forEach(header => {
      const val = githubResponse.headers.get(header);
      if (val) newHeaders.set(header, val);
    });

    return new Response(githubResponse.body, {
      status: githubResponse.status,
      statusText: githubResponse.statusText,
      headers: newHeaders,
    });
  } catch (err: any) {
    return new Response(err.message, { 
      status: 500, 
      headers: { "Access-Control-Allow-Origin": "*" } 
    });
  }
}
