import { createClient, Errors } from "@farcaster/quick-auth";
import { NextResponse } from "next/server";

const client = createClient();

export async function GET(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Missing Quick Auth bearer token." },
      { status: 401 },
    );
  }

  try {
    const url = new URL(request.url);
    const payload = await client.verifyJwt({
      token: authorization.slice("Bearer ".length),
      domain: url.host,
    });

    return NextResponse.json({ fid: payload.sub });
  } catch (error) {
    if (error instanceof Errors.InvalidTokenError) {
      return NextResponse.json(
        { error: "Invalid Quick Auth token." },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { error: "Quick Auth verification failed." },
      { status: 500 },
    );
  }
}
