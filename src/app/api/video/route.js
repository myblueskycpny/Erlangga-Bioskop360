// src/app/api/video/route.js

export async function GET() {
  const apiKey = process.env.API_KEY;
  const apiUrl = process.env.API_URL;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        "BCOV-Policy": apiKey,
      },
      cache: "no-store", // Penting agar fetch selalu fresh di server
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: "Failed to fetch video" }), {
        status: response.status,
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
