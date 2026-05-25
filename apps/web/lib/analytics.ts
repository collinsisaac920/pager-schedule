import { posthog } from "./posthog";

export function identifyUser(user: {
  id: string;
  email: string;
  name?: string;
  plan?: string;
  role?: string;
}) {
  posthog.identify(user.id, {
    email: user.email,
    name: user.name,
    plan: user.plan ?? "free",
    role: user.role,
  });
}

export function resetUser() {
  posthog.reset();
}

export function track(event: string, properties?: Record<string, unknown>) {
  posthog.capture(event, properties);
}
