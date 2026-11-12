import { NextRequest, NextResponse } from "next/server";

const getBackendUrl = () => {
  return process.env.BACKEND_INTERNAL_URL || "http://backend:8000";
};

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const backendBase = getBackendUrl();
  const subpath = params.path ? params.path.join("/") : "";
  const query = request.nextUrl.search;
  const target = `${backendBase}/api/${subpath}${query}`;

  try {
    const res = await fetch(target, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    const body = await res.text();
    return new NextResponse(body, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { detail: `Proxy error to backend: ${err.message}` },
      { status: 502 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const backendBase = getBackendUrl();
  const subpath = params.path ? params.path.join("/") : "";
  const query = request.nextUrl.search;
  const target = `${backendBase}/api/${subpath}${query}`;
  const reqBody = await request.text();

  try {
    const res = await fetch(target, {
      method: "POST",
      body: reqBody,
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    const body = await res.text();
    return new NextResponse(body, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { detail: `Proxy error to backend: ${err.message}` },
      { status: 502 }
    );
  }
}

