const baseUrl = process.env.SMOKE_URL ?? "http://127.0.0.1:3000";

async function assertJson(path, validate) {
  const response = await fetch(new URL(path, baseUrl));

  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}`);
  }

  const json = await response.json();
  validate(json);
}

async function assertJsonPost(path, body, validate) {
  const response = await fetch(new URL(path, baseUrl), {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}`);
  }

  const json = await response.json();
  validate(json);
}

async function assertText(path, validate) {
  const response = await fetch(new URL(path, baseUrl));

  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}`);
  }

  const text = await response.text();
  validate(text);
}

await assertText("/", (text) => {
  if (!text.includes("Overlap")) {
    throw new Error("Home page did not include Overlap branding");
  }

  if (!text.includes("fc:miniapp")) {
    throw new Error("Home page did not include the fc:miniapp embed metadata");
  }
});

await assertJson("/api/provider-status", (json) => {
  if (!json.snapchain || !json.neynar) {
    throw new Error("Provider status payload was incomplete");
  }
});

await assertJson("/api/matches", (json) => {
  if (!Array.isArray(json.matches) || json.matches.length === 0) {
    throw new Error("Matches API returned no candidates");
  }
});

await assertJsonPost(
  "/api/profile",
  {
    roles: ["builder"],
    ecosystems: ["base"],
    interests: ["ai"],
    seeking: ["feedback"],
    offering: ["build"],
    about: "Testing the profile endpoint.",
    building: "Testing the smoke path.",
  },
  (json) => {
    if (json.completeness?.roles !== 1 || json.completeness?.offering !== 1) {
      throw new Error("Profile API did not return the expected completeness summary");
    }
  },
);

await assertJson("/.well-known/farcaster.json", (json) => {
  if (json.miniapp?.name !== "Overlap") {
    throw new Error("Manifest did not expose the Overlap miniapp metadata");
  }
});

console.log("smoke ok");
