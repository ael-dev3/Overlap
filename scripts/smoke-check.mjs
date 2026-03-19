const baseUrl = process.env.SMOKE_URL ?? "http://127.0.0.1:3000";

async function assertJson(path, validate) {
  const response = await fetch(new URL(path, baseUrl));

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

await assertText("/overlap-card.svg", (text) => {
  if (!text.includes("Overlap")) {
    throw new Error("Card asset did not render the expected Overlap label");
  }
});

await assertJson("/.well-known/farcaster.json", (json) => {
  if (!json.accountAssociation) {
    throw new Error("Manifest did not expose accountAssociation");
  }

  if (json.accountAssociation.payload !== "eyJkb21haW4iOiJvdmVybGFwLWZjLndlYi5hcHAifQ") {
    throw new Error("Manifest accountAssociation payload did not match the configured domain");
  }

  if (json.miniapp?.name !== "Overlap") {
    throw new Error("Manifest did not expose the Overlap miniapp metadata");
  }

  if (json.miniapp?.homeUrl !== "https://overlap-fc.web.app/?miniApp=true") {
    throw new Error("Manifest did not point to the expected Firebase Hosting URL");
  }

  if ((json.miniapp?.subtitle?.length ?? 0) > 30) {
    throw new Error("Manifest subtitle exceeded Farcaster's 30 character limit");
  }

  if ((json.miniapp?.tagline?.length ?? 0) > 30) {
    throw new Error("Manifest tagline exceeded Farcaster's 30 character limit");
  }

  if (!json.miniapp?.requiredCapabilities?.includes("wallet.getEthereumProvider")) {
    throw new Error("Manifest did not declare wallet.getEthereumProvider capability");
  }
});

console.log("smoke ok");
